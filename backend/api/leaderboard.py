from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import get_db
from models.user import User
from models.progress import LevelProgress
from models.certificate import Certificate
from api.auth import get_current_user

router = APIRouter()

@router.get("")
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(User).order_by(desc(User.total_xp)).limit(50).all()
    result = []
    
    for idx, u in enumerate(users, start=1):
        completed_levels = db.query(LevelProgress).filter(
            LevelProgress.user_id == u.id, LevelProgress.status == "completed"
        ).count()
        cert_count = db.query(Certificate).filter(Certificate.user_id == u.id).count()

        result.append({
            "rank": idx,
            "username": u.username,
            "full_name": u.full_name,
            "country": u.country or "US",
            "total_xp": u.total_xp,
            "completed_levels": completed_levels,
            "certificates_count": cert_count,
            "streak_days": u.streak_days
        })

    return result

@router.get("/me")
def get_my_rank(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    all_users = db.query(User).order_by(desc(User.total_xp)).all()
    my_rank = next((idx for idx, u in enumerate(all_users, start=1) if u.id == user.id), 1)
    
    completed_levels = db.query(LevelProgress).filter(
        LevelProgress.user_id == user.id, LevelProgress.status == "completed"
    ).count()

    return {
        "rank": my_rank,
        "username": user.username,
        "total_xp": user.total_xp,
        "completed_levels": completed_levels,
        "streak_days": user.streak_days
    }
