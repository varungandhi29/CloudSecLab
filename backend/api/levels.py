from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os
import json
from config import settings
from database import get_db
from models.user import User
from models.progress import LevelProgress
from api.auth import get_current_user
from services.scoring_service import calculate_level_xp

router = APIRouter()

def get_level_json_path(level_id: int) -> str:
    filename = f"level_{level_id:03d}.json"
    return os.path.join(settings.CONTENT_DIR, "levels", filename)

@router.get("")
def list_levels(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    levels_dir = os.path.join(settings.CONTENT_DIR, "levels")
    user_progress_map = {
        p.level_id: p for p in db.query(LevelProgress).filter(LevelProgress.user_id == user.id).all()
    }

    result = []
    for i in range(1, 101):
        path = os.path.join(levels_dir, f"level_{i:03d}.json")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)

            prog = user_progress_map.get(i)
            status = "locked"
            if i == 1 or (i - 1 in user_progress_map and user_progress_map[i - 1].status == "completed"):
                status = "unlocked"
            if prog:
                status = prog.status

            result.append({
                "level_id": data["level_id"],
                "title": data["title"],
                "track": data["track"],
                "category": data["category"],
                "cloud_platform": data["cloud_platform"],
                "xp_reward": data["xp_reward"],
                "estimated_minutes": data["estimated_minutes"],
                "status": status,
                "theory_completed": prog.theory_completed if prog else False,
                "lab_completed": prog.lab_completed if prog else False,
                "problem_solving_score": prog.problem_solving_score if prog else 0
            })

    return result

@router.get("/{level_id}")
def get_level_detail(level_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    path = get_level_json_path(level_id)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Level not found")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    prog = db.query(LevelProgress).filter(
        LevelProgress.user_id == user.id, LevelProgress.level_id == level_id
    ).first()

    data["user_progress"] = {
        "status": prog.status if prog else "unlocked" if level_id == 1 else "locked",
        "theory_completed": prog.theory_completed if prog else False,
        "demo_completed": prog.demo_completed if prog else False,
        "lab_completed": prog.lab_completed if prog else False,
        "hints_used": prog.hints_used if prog else 0,
        "problem_solving_score": prog.problem_solving_score if prog else 0,
        "forensics_completed": prog.forensics_completed if prog else False
    }

    return data

@router.get("/{level_id}/hints")
def get_level_hint(level_id: int, hint_index: int = 0, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    path = get_level_json_path(level_id)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Level not found")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    hints = data.get("lab", {}).get("hints", [])
    if hint_index < 0 or hint_index >= len(hints):
        raise HTTPException(status_code=400, detail="Hint index out of range")

    prog = db.query(LevelProgress).filter(
        LevelProgress.user_id == user.id, LevelProgress.level_id == level_id
    ).first()

    if not prog:
        prog = LevelProgress(user_id=user.id, level_id=level_id, status="unlocked")
        db.add(prog)

    if hint_index >= prog.hints_used:
        prog.hints_used = hint_index + 1
        db.commit()

    return {
        "hint_index": hint_index,
        "hint": hints[hint_index],
        "total_hints": len(hints),
        "hints_used": prog.hints_used
    }

@router.post("/{level_id}/theory/complete")
def complete_theory(level_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prog = db.query(LevelProgress).filter(
        LevelProgress.user_id == user.id, LevelProgress.level_id == level_id
    ).first()

    if not prog:
        prog = LevelProgress(user_id=user.id, level_id=level_id, status="unlocked")
        db.add(prog)

    if not prog.theory_completed:
        prog.theory_completed = True
        user.total_xp += 50
        db.commit()

    return {"message": "Theory marked as completed", "xp_gained": 50, "total_xp": user.total_xp}

@router.post("/{level_id}/demo/complete")
def complete_demo(level_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prog = db.query(LevelProgress).filter(
        LevelProgress.user_id == user.id, LevelProgress.level_id == level_id
    ).first()

    if not prog:
        prog = LevelProgress(user_id=user.id, level_id=level_id, status="unlocked")
        db.add(prog)

    if not prog.demo_completed:
        prog.demo_completed = True
        user.total_xp += 25
        db.commit()

    return {"message": "Demo marked as completed", "xp_gained": 25, "total_xp": user.total_xp}
