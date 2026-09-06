from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models.user import User
from api.auth import get_current_user

router = APIRouter()

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None

@router.get("/profile")
def get_profile(user: User = Depends(get_current_user)):
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
        "created_at": user.created_at
    }

@router.put("/profile")
def update_profile(
    req: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if req.full_name is not None:
        user.full_name = req.full_name
    if req.country is not None:
        user.country = req.country
    if req.bio is not None:
        user.bio = req.bio

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "country": user.country,
        "bio": user.bio
    }
