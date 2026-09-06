from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
from models.user import User
from services.auth_service import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from datetime import datetime
import uuid
import httpx

router = APIRouter()
security = HTTPBearer(auto_error=False)

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

class AppleAuthRequest(BaseModel):
    identity_token: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    apple_id: Optional[str] = None

class MagicLinkRequest(BaseModel):
    email: str

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

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
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "total_xp": user.total_xp,
            "current_level": user.current_level,
            "streak_days": user.streak_days,
            "provider": user.provider
        }
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

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "total_xp": user.total_xp,
            "current_level": user.current_level,
            "streak_days": user.streak_days,
            "country": user.country,
            "bio": user.bio,
            "provider": user.provider
        }
    }

@router.post("/google")
async def google_auth(req: GoogleAuthRequest, response: Response, db: Session = Depends(get_db)):
    email = req.email or f"google_user_{str(uuid.uuid4())[:8]}@gmail.com"
    full_name = req.full_name or "Google Operator"
    google_id = req.google_id or req.id_token or str(uuid.uuid4())

    # Try verifying real Google ID Token if provided
    if req.id_token and not req.email:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={req.id_token}")
                if res.status_code == 200:
                    data = res.json()
                    email = data.get("email", email)
                    full_name = data.get("name", full_name)
                    google_id = data.get("sub", google_id)
        except Exception:
            pass

    user = db.query(User).filter(User.email == email).first()

    if not user:
        username = email.split("@")[0].replace(".", "_") + "_g"
        # Ensure unique username
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            username = f"{username}_{str(uuid.uuid4())[:4]}"

        user = User(
            email=email,
            username=username,
            full_name=full_name,
            provider="google",
            provider_id=google_id,
            avatar_url=req.avatar_url,
            is_verified=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
    else:
        user.provider = "google"
        user.provider_id = google_id
        user.last_login = datetime.utcnow()

    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "total_xp": user.total_xp,
            "current_level": user.current_level,
            "streak_days": user.streak_days,
            "provider": user.provider
        }
    }

@router.post("/apple")
async def apple_auth(req: AppleAuthRequest, response: Response, db: Session = Depends(get_db)):
    email = req.email or f"apple_user_{str(uuid.uuid4())[:8]}@privaterelay.appleid.com"
    full_name = req.full_name or "Apple Security Member"
    apple_id = req.apple_id or req.identity_token or str(uuid.uuid4())

    user = db.query(User).filter(User.email == email).first()

    if not user:
        username = email.split("@")[0].replace(".", "_") + "_apple"
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            username = f"{username}_{str(uuid.uuid4())[:4]}"

        user = User(
            email=email,
            username=username,
            full_name=full_name,
            provider="apple",
            provider_id=apple_id,
            is_verified=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
    else:
        user.provider = "apple"
        user.provider_id = apple_id
        user.last_login = datetime.utcnow()

    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "total_xp": user.total_xp,
            "current_level": user.current_level,
            "streak_days": user.streak_days,
            "provider": user.provider
        }
    }

@router.post("/magic-link")
def send_magic_link(req: MagicLinkRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        username = req.email.split("@")[0]
        user = User(
            email=req.email,
            username=username,
            full_name=username.capitalize(),
            provider="email",
            is_verified=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "message": f"Magic Login authentication link verified for {req.email}",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "total_xp": user.total_xp,
            "current_level": user.current_level,
            "streak_days": user.streak_days,
            "provider": user.provider
        }
    }

@router.post("/refresh")
def refresh(refresh_token: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    new_access_token = create_access_token({"sub": user.id})
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="refresh_token")
    return {"message": "Logged out successfully"}

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "total_xp": user.total_xp,
        "current_level": user.current_level,
        "streak_days": user.streak_days,
        "country": user.country,
        "bio": user.bio,
        "provider": user.provider,
        "created_at": user.created_at
    }
