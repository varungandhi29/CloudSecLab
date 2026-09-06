from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid
import os
import json
from datetime import datetime, timedelta
from database import get_db
from models.user import User
from models.progress import LevelProgress
from models.lab_session import LabSession
from api.auth import get_current_user
from services.lab_engine import LabEngine
from config import settings

router = APIRouter()

class ValidateLabRequest(BaseModel):
    user_answer: Optional[str] = None

@router.post("/{level_id}/start")
async def start_lab(level_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    path = os.path.join(settings.CONTENT_DIR, "levels", f"level_{level_id:03d}.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Level not found")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    engine = LabEngine(level_id)
    is_healthy = await engine.check_localstack_health()

    setup_commands = data.get("lab", {}).get("setup_commands", [])
    setup_result = await engine.setup_lab(setup_commands)

    # Manage session record
    session_id = str(uuid.uuid4())
    expires = datetime.utcnow() + timedelta(minutes=settings.LAB_SESSION_TIMEOUT_MINUTES)
    
    session = db.query(LabSession).filter(
        LabSession.user_id == user.id, LabSession.level_id == level_id
    ).first()

    if not session:
        session = LabSession(
            user_id=user.id,
            level_id=level_id,
            session_id=session_id,
            status="active",
            created_at=datetime.utcnow(),
            expires_at=expires
        )
        db.add(session)
    else:
        session.session_id = session_id
        session.status = "active"
        session.expires_at = expires

    db.commit()

    return {
        "status": "ready" if setup_result.get("success", True) else "setup_warning",
        "localstack_healthy": is_healthy,
        "session_id": session_id,
        "objective": data.get("lab", {}).get("objective"),
        "expires_at": expires,
        "setup_result": setup_result
    }

@router.post("/{level_id}/validate")
async def validate_lab(
    level_id: int,
    req: ValidateLabRequest = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    path = os.path.join(settings.CONTENT_DIR, "levels", f"level_{level_id:03d}.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Level not found")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    validation_spec = data.get("lab", {}).get("validation", {})
    user_answer = req.user_answer if req else None

    engine = LabEngine(level_id)
    res = await engine.validate_lab(validation_spec, user_answer=user_answer)

    if res.get("passed"):
        prog = db.query(LevelProgress).filter(
            LevelProgress.user_id == user.id, LevelProgress.level_id == level_id
        ).first()
        if not prog:
            prog = LevelProgress(user_id=user.id, level_id=level_id, status="unlocked")
            db.add(prog)

        if not prog.lab_completed:
            prog.lab_completed = True
            user.total_xp += 100
            db.commit()

    return res

@router.get("/{level_id}/status")
def get_lab_status(level_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(LabSession).filter(
        LabSession.user_id == user.id, LabSession.level_id == level_id
    ).first()

    if not session:
        return {"status": "inactive"}

    is_expired = session.expires_at and session.expires_at < datetime.utcnow()
    return {
        "status": "expired" if is_expired else session.status,
        "session_id": session.session_id,
        "created_at": session.created_at,
        "expires_at": session.expires_at
    }

@router.post("/{level_id}/reset")
async def reset_lab(level_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    path = os.path.join(settings.CONTENT_DIR, "levels", f"level_{level_id:03d}.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Level not found")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    setup_commands = data.get("lab", {}).get("setup_commands", [])
    engine = LabEngine(level_id)
    setup_result = await engine.reset_lab(setup_commands)

    return {
        "message": "Lab environment reset successfully",
        "status": "ready",
        "setup_result": setup_result
    }

@router.delete("/{level_id}")
def destroy_lab(level_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(LabSession).filter(
        LabSession.user_id == user.id, LabSession.level_id == level_id
    ).first()
    if session:
        session.status = "destroyed"
        db.commit()
    return {"message": "Lab session terminated"}
