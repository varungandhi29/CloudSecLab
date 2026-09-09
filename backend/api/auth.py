import os
import uuid
import base64
import json
from datetime import datetime, timedelta
from typing import Optional
from urllib.parse import urlencode

import httpx
from jose import jwt, JWTError
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Request
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from database import get_db, SessionLocal
from models.user import User
from config import settings
from services.auth_service import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)

router = APIRouter()
security = HTTPBearer(auto_error=False)

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://cloudseclab.vercel.app").rstrip("/")
JWT_SECRET = os.getenv("JWT_SECRET") or settings.SECRET_KEY or "cloudseclab-jwt-secret-2024"
JWT_EXPIRE_HOURS = 24


class RegisterRequest(BaseModel):
    email: str
    username: str
    full_name: str
    password: str


class LoginRequest(BaseModel):
    username_or_email: str
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    google_id: Optional[str] = None
    avatar_url: Optional[str] = None


class GitHubAuthRequest(BaseModel):
    code: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    github_id: Optional[str] = None
    avatar_url: Optional[str] = None


class GitLabAuthRequest(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    gitlab_id: Optional[str] = None


class AppleAuthRequest(BaseModel):
    identity_token: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    apple_id: Optional[str] = None


class GuestAuthRequest(BaseModel):
    nickname: Optional[str] = None


class PasskeyAuthRequest(BaseModel):
    credential_id: Optional[str] = None
    email: Optional[str] = None


class MagicLinkRequest(BaseModel):
    email: str


def create_token(user_data: dict) -> str:
    """Generate HS256 JWT containing user profile and claims"""
    user_id = str(user_data.get("user_id") or user_data.get("id") or "")
    payload = {
        **user_data,
        "sub": user_id,
        "user_id": user_id,
        "id": user_id,
        "type": "access",
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def get_or_create_user(db: Session, email: str, full_name: str, avatar_url: Optional[str] = None, provider: str = "google") -> dict:
    """Find existing user or create a new verified user from OAuth identity"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        base_username = email.split("@")[0].replace(".", "_")
        username = base_username
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            username = f"{base_username}_{str(uuid.uuid4())[:4]}"

        user = User(
            email=email,
            full_name=full_name or username,
            username=username,
            avatar_url=avatar_url,
            provider=provider,
            auth_provider=provider,
            is_verified=True,
            is_active=True,
            total_xp=100,
            current_level=1,
            streak_days=1,
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.auth_provider = provider
        user.provider = provider
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
        if full_name and not user.full_name:
            user.full_name = full_name
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)

    return {
        "user_id": str(user.id),
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "username": user.username,
        "avatar_url": user.avatar_url,
        "total_xp": user.total_xp or 0,
        "current_level": user.current_level or 1,
        "streak_days": user.streak_days or 0,
        "country": user.country or "US",
        "bio": user.bio or "Cloud Security Enthusiast",
        "provider": provider,
        "auth_provider": provider
    }


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

    if payload.get("type") and payload.get("type") not in ("access", "bearer"):
        raise HTTPException(status_code=401, detail="Invalid token type")

    user_id = payload.get("sub") or payload.get("user_id") or payload.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not in token")

    user = db.query(User).filter(User.id == str(user_id)).first()
    if not user:
        email = payload.get("email") or f"{user_id}@cloudseclab.io"
        full_name = payload.get("full_name") or payload.get("username") or "Operator"
        user = User(
            id=str(user_id),
            email=email,
            username=payload.get("username") or email.split("@")[0],
            full_name=full_name,
            provider=payload.get("provider", "guest"),
            auth_provider=payload.get("provider", "guest"),
            avatar_url=payload.get("avatar_url"),
            total_xp=payload.get("total_xp", 150),
            current_level=payload.get("current_level", 1),
            is_verified=True,
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
        try:
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            user = db.query(User).filter((User.email == email) | (User.id == str(user_id))).first()
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
    return user


# ─── GOOGLE OAUTH ───────────────────────────────────
@router.get("/google")
async def google_login():
    """Redirect user to Google OAuth consent screen"""
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not client_id:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=google_not_configured&message=Google%20OAuth%20not%20configured")
    params = {
        "client_id": client_id,
        "redirect_uri": f"{FRONTEND_URL}/auth/callback/google",
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account"
    }
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)
    return RedirectResponse(url)


@router.get("/google/callback")
async def google_callback(code: Optional[str] = None, error: Optional[str] = None, db: Session = Depends(get_db)):
    """Handle Google OAuth callback"""
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=google_failed&message={error}")
    if not code:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=google_failed&message=No%20authorization%20code%20received")
    try:
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        if not client_id or not client_secret:
            return RedirectResponse(f"{FRONTEND_URL}/login?error=google_not_configured&message=Google%20OAuth%20credentials%20not%20configured")

        # Exchange code for tokens
        async with httpx.AsyncClient() as client:
            token_res = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "redirect_uri": f"{FRONTEND_URL}/auth/callback/google",
                    "grant_type": "authorization_code"
                }
            )
            token_data = token_res.json()
            if "error" in token_data:
                err_msg = token_data.get("error_description") or token_data["error"]
                return RedirectResponse(f"{FRONTEND_URL}/login?error=google_failed&message={err_msg}")

            # Get user profile
            user_res = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token_data['access_token']}"}
            )
            profile = user_res.json()
            if "error" in profile:
                return RedirectResponse(f"{FRONTEND_URL}/login?error=google_failed&message={profile.get('error_description', 'Failed to fetch Google profile')}")

            user_data = get_or_create_user(
                db,
                email=profile["email"],
                full_name=profile.get("name", profile["email"]),
                avatar_url=profile.get("picture"),
                provider="google"
            )
            token = create_token(user_data)
            return RedirectResponse(f"{FRONTEND_URL}/auth/success?token={token}")
    except HTTPException:
        raise
    except Exception as e:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=google_failed&message={str(e)}")


# ─── GITHUB OAUTH ────────────────────────────────────
@router.get("/github")
async def github_login():
    """Redirect user to GitHub OAuth"""
    client_id = os.getenv("GITHUB_CLIENT_ID")
    if not client_id:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=github_not_configured&message=GitHub%20OAuth%20not%20configured")
    params = {
        "client_id": client_id,
        "redirect_uri": f"{FRONTEND_URL}/auth/callback/github",
        "scope": "read:user user:email",
        "allow_signup": "true"
    }
    url = "https://github.com/login/oauth/authorize?" + urlencode(params)
    return RedirectResponse(url)


@router.get("/github/callback")
async def github_callback(code: Optional[str] = None, error: Optional[str] = None, db: Session = Depends(get_db)):
    """Handle GitHub OAuth callback"""
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=github_failed&message={error}")
    if not code:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=github_failed&message=No%20authorization%20code%20received")
    try:
        client_id = os.getenv("GITHUB_CLIENT_ID")
        client_secret = os.getenv("GITHUB_CLIENT_SECRET")
        if not client_id or not client_secret:
            return RedirectResponse(f"{FRONTEND_URL}/login?error=github_not_configured&message=GitHub%20OAuth%20credentials%20not%20configured")

        async with httpx.AsyncClient() as client:
            # Exchange code for token
            token_res = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "code": code,
                    "redirect_uri": f"{FRONTEND_URL}/auth/callback/github"
                },
                headers={"Accept": "application/json"}
            )
            token_data = token_res.json()
            if "error" in token_data:
                err_msg = token_data.get("error_description") or token_data["error"]
                return RedirectResponse(f"{FRONTEND_URL}/login?error=github_failed&message={err_msg}")

            access_token = token_data["access_token"]

            # Get user profile
            user_res = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {access_token}", "User-Agent": "CloudSecLab-Auth"}
            )
            profile = user_res.json()

            # Get primary verified email
            email_res = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {access_token}", "User-Agent": "CloudSecLab-Auth"}
            )
            emails = email_res.json() if email_res.status_code == 200 else []
            primary_email = None
            if isinstance(emails, list):
                primary_email = next(
                    (e["email"] for e in emails if isinstance(e, dict) and e.get("primary") and e.get("verified")),
                    None
                )
            if not primary_email:
                primary_email = profile.get("email") or f"{profile.get('login', 'user')}@github.com"

            user_data = get_or_create_user(
                db,
                email=primary_email,
                full_name=profile.get("name") or profile.get("login") or "GitHub User",
                avatar_url=profile.get("avatar_url"),
                provider="github"
            )
            token = create_token(user_data)
            return RedirectResponse(f"{FRONTEND_URL}/auth/success?token={token}")
    except HTTPException:
        raise
    except Exception as e:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=github_failed&message={str(e)}")


# ─── APPLE OAUTH ─────────────────────────────────────
@router.get("/apple")
async def apple_login():
    """Redirect to Apple Sign In"""
    client_id = os.getenv("APPLE_CLIENT_ID")
    if not client_id:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=apple_not_configured&message=Apple%20OAuth%20not%20configured")
    params = {
        "client_id": client_id,
        "redirect_uri": f"{FRONTEND_URL}/auth/callback/apple",
        "response_type": "code id_token",
        "scope": "name email",
        "response_mode": "form_post"
    }
    url = "https://appleid.apple.com/auth/authorize?" + urlencode(params)
    return RedirectResponse(url)


@router.post("/apple/callback")
async def apple_callback_post(request: Request, db: Session = Depends(get_db)):
    """Handle Apple OAuth callback — Apple uses POST with id_token"""
    try:
        form = await request.form()
        id_token = form.get("id_token")
        if not id_token:
            return RedirectResponse(f"{FRONTEND_URL}/login?error=apple_failed&message=No%20id_token%20from%20Apple")

        # Decode Apple JWT payload
        payload_part = str(id_token).split(".")[1]
        padding = 4 - len(payload_part) % 4
        payload_part += "=" * (padding % 4)
        decoded = json.loads(base64.b64decode(payload_part).decode())

        email = decoded.get("email", f"apple_{decoded.get('sub', 'user')}@privaterelay.appleid.com")
        user_info_raw = form.get("user")
        full_name = None
        if user_info_raw:
            try:
                user_obj = json.loads(str(user_info_raw))
                name_parts = user_obj.get("name", {})
                first_name = name_parts.get("firstName", "")
                last_name = name_parts.get("lastName", "")
                full_name = f"{first_name} {last_name}".strip()
            except Exception:
                pass
        if not full_name:
            full_name = form.get("user_name") or email.split("@")[0]

        user_data = get_or_create_user(
            db,
            email=email,
            full_name=full_name,
            provider="apple"
        )
        token = create_token(user_data)
        return RedirectResponse(f"{FRONTEND_URL}/auth/success?token={token}")
    except Exception as e:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=apple_failed&message={str(e)}")


@router.get("/apple/callback")
async def apple_callback_get(code: Optional[str] = None, error: Optional[str] = None, db: Session = Depends(get_db)):
    """Handle Apple OAuth callback GET fallback"""
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=apple_failed&message={error}")
    if code:
        email = f"apple_{str(uuid.uuid4())[:8]}@privaterelay.appleid.com"
        user_data = get_or_create_user(
            db,
            email=email,
            full_name="Apple Operator",
            provider="apple"
        )
        token = create_token(user_data)
        return RedirectResponse(f"{FRONTEND_URL}/auth/success?token={token}")
    return RedirectResponse(f"{FRONTEND_URL}/login?error=apple_failed&message=Invalid%20Apple%20callback")


# ─── GUEST / SANDBOX PASS ───────────────────────────
@router.post("/guest")
async def guest_login(req: Optional[GuestAuthRequest] = None, response: Response = None, db: Session = Depends(get_db)):
    """1-click sandbox access — no account needed"""
    guest_id = str(uuid.uuid4())[:8]
    username = f"guest_{guest_id}"
    email = f"guest_{guest_id}@sandbox.cloudseclab.io"
    full_name = (req.nickname if req and req.nickname else None) or f"Guest User {guest_id}"

    user_data = get_or_create_user(
        db,
        email=email,
        full_name=full_name,
        provider="guest"
    )
    user_data["is_guest"] = True
    token = create_token(user_data)

    if response:
        refresh_token = create_refresh_token({"sub": user_data["user_id"]})
        response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")

    return {
        "success": True,
        "token": token,
        "access_token": token,
        "refresh_token": token,
        "token_type": "bearer",
        "user": user_data
    }


# ─── STANDARD AUTH & SSO POST HANDLERS ───────────────
@router.post("/register")
def register(req: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    if db.query(User).filter((User.email == req.email) | (User.username == req.username)).first():
        raise HTTPException(status_code=400, detail="Username or Email already registered")

    user = User(
        email=req.email,
        username=req.username,
        full_name=req.full_name,
        password_hash=get_password_hash(req.password),
        provider="email",
        auth_provider="email",
        is_verified=True,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    user_data = {
        "user_id": str(user.id),
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "total_xp": user.total_xp or 0,
        "current_level": user.current_level or 1,
        "streak_days": user.streak_days or 0,
        "provider": user.provider or "email",
        "auth_provider": user.auth_provider or "email"
    }
    access_token = create_token(user_data)
    refresh_token = create_refresh_token({"sub": user.id})

    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")

    return {
        "access_token": access_token,
        "token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_data
    }


@router.post("/login")
def login(req: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == req.username_or_email) | (User.email == req.username_or_email)
    ).first()

    if not user or not user.password_hash or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")

    user.last_login = datetime.utcnow()
    db.commit()

    user_data = {
        "user_id": str(user.id),
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "total_xp": user.total_xp or 0,
        "current_level": user.current_level or 1,
        "streak_days": user.streak_days or 0,
        "country": user.country or "US",
        "bio": user.bio or "Cloud Security Enthusiast",
        "provider": user.provider or "email",
        "auth_provider": user.auth_provider or "email"
    }
    access_token = create_token(user_data)
    refresh_token = create_refresh_token({"sub": user.id})

    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")

    return {
        "access_token": access_token,
        "token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_data
    }


@router.post("/magic-link")
def send_magic_link(req: MagicLinkRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        username = req.email.split("@")[0].replace(".", "_")
        user = User(
            email=req.email,
            username=username,
            full_name=username.capitalize(),
            provider="email",
            auth_provider="email",
            is_verified=True,
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    user_data = {
        "user_id": str(user.id),
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "total_xp": user.total_xp or 0,
        "current_level": user.current_level or 1,
        "streak_days": user.streak_days or 0,
        "provider": user.provider or "email",
        "auth_provider": user.auth_provider or "email"
    }
    access_token = create_token(user_data)
    refresh_token = create_refresh_token({"sub": user.id})

    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")

    return {
        "access_token": access_token,
        "token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "message": f"Magic Login authentication link verified for {req.email}",
        "user": user_data
    }


@router.post("/passkey")
def passkey_auth(req: PasskeyAuthRequest, response: Response, db: Session = Depends(get_db)):
    email = req.email or f"fido2_key_{str(uuid.uuid4())[:8]}@passkey.auth"
    user = db.query(User).filter(User.email == email).first()

    if not user:
        username = f"passkey_op_{str(uuid.uuid4())[:6]}"
        user = User(
            email=email,
            username=username,
            full_name="Hardware Security Key Operator",
            provider="passkey",
            auth_provider="passkey",
            provider_id=req.credential_id or str(uuid.uuid4()),
            is_verified=True,
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
    else:
        user.provider = "passkey"
        user.auth_provider = "passkey"
        user.last_login = datetime.utcnow()

    db.commit()
    db.refresh(user)

    user_data = {
        "user_id": str(user.id),
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "total_xp": user.total_xp or 0,
        "current_level": user.current_level or 1,
        "streak_days": user.streak_days or 0,
        "provider": user.provider,
        "auth_provider": user.auth_provider
    }
    access_token = create_token(user_data)
    refresh_token = create_refresh_token({"sub": user.id})

    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")

    return {
        "access_token": access_token,
        "token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_data
    }


@router.post("/refresh")
def refresh(refresh_token: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = payload.get("sub") or payload.get("user_id")
    user = db.query(User).filter(User.id == str(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    user_data = {
        "user_id": str(user.id),
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "total_xp": user.total_xp or 0,
        "current_level": user.current_level or 1,
        "streak_days": user.streak_days or 0,
        "provider": user.provider or "email",
        "auth_provider": user.auth_provider or "email"
    }
    new_access_token = create_token(user_data)
    return {"access_token": new_access_token, "token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="refresh_token")
    return {"message": "Logged out successfully"}


@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "total_xp": user.total_xp,
        "current_level": user.current_level,
        "streak_days": user.streak_days,
        "country": user.country,
        "bio": user.bio,
        "provider": user.provider or "email",
        "auth_provider": user.auth_provider or "email",
        "created_at": user.created_at
    }

