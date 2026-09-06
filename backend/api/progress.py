from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime
import os
import json
from database import get_db
from models.user import User
from models.progress import LevelProgress
from api.auth import get_current_user
from config import settings

router = APIRouter()

class ProblemSolvingSubmission(BaseModel):
    answers: Dict[str, Any]

class ForensicsSubmission(BaseModel):
    answers: Dict[str, Any]

@router.get("")
def get_all_progress(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    progress_records = db.query(LevelProgress).filter(LevelProgress.user_id == user.id).all()
    return progress_records

@router.get("/stats")
def get_progress_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(LevelProgress).filter(LevelProgress.user_id == user.id).all()
    completed_count = sum(1 for r in records if r.status == "completed")
    
    return {
        "total_xp": user.total_xp,
        "completed_levels": completed_count,
        "total_levels": 100,
        "completion_percentage": round((completed_count / 100.0) * 100, 1),
        "streak_days": user.streak_days,
        "current_level": user.current_level
    }

@router.post("/{level_id}/problem-solving")
def submit_problem_solving(
    level_id: int,
    sub: ProblemSolvingSubmission,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    path = os.path.join(settings.CONTENT_DIR, "levels", f"level_{level_id:03d}.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Level not found")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    ps_spec = data.get("problem_solving", {})
    questions = ps_spec.get("questions", [])
    total_q = len(questions)
    correct_count = 0

    for q in questions:
        qid = str(q["id"])
        user_ans = str(sub.answers.get(qid, "")).strip().lower()
        if q["type"] == "multiple_choice":
            if user_ans == str(q["correct"]).strip().lower():
                correct_count += 1
        elif q["type"] == "policy_analysis":
            if any(k in user_ans for k in ["admin", "full", "wildcard", "*", "everything", "escalat"]):
                correct_count += 1
        elif q["type"] == "scenario":
            keywords = q.get("correct_keywords", [])
            if any(kw in user_ans for kw in keywords):
                correct_count += 1

    score_pct = (correct_count / total_q * 100) if total_q > 0 else 100.0
    passed = score_pct >= ps_spec.get("passing_score", 70)

    prog = db.query(LevelProgress).filter(
        LevelProgress.user_id == user.id, LevelProgress.level_id == level_id
    ).first()

    if not prog:
        prog = LevelProgress(user_id=user.id, level_id=level_id, status="unlocked")
        db.add(prog)

    prog.problem_solving_score = score_pct
    if passed:
        prog.status = "completed"
        prog.completed_at = datetime.utcnow()
        if user.current_level <= level_id:
            user.current_level = level_id + 1

        # Unlock next level in progress
        next_prog = db.query(LevelProgress).filter(
            LevelProgress.user_id == user.id, LevelProgress.level_id == level_id + 1
        ).first()
        if not next_prog and level_id < 100:
            db.add(LevelProgress(user_id=user.id, level_id=level_id + 1, status="unlocked"))
        elif next_prog and next_prog.status == "locked":
            next_prog.status = "unlocked"

        user.total_xp += int(score_pct)

    db.commit()

    return {
        "score": round(score_pct, 1),
        "passed": passed,
        "correct_count": correct_count,
        "total_questions": total_q,
        "feedback": "Great job! Next level unlocked." if passed else "Score under 70%. Review material and try again."
    }

@router.post("/{level_id}/forensics")
def submit_forensics(
    level_id: int,
    sub: ForensicsSubmission,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    path = os.path.join(settings.CONTENT_DIR, "levels", f"level_{level_id:03d}.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Level not found")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    forensics = data.get("forensics", {})
    questions = forensics.get("questions", [])
    correct_count = 0

    for idx, q in enumerate(questions):
        user_ans = str(sub.answers.get(str(idx), "")).strip().lower()
        if user_ans == str(q["correct"]).strip().lower():
            correct_count += 1

    passed = correct_count == len(questions)

    prog = db.query(LevelProgress).filter(
        LevelProgress.user_id == user.id, LevelProgress.level_id == level_id
    ).first()

    if not prog:
        prog = LevelProgress(user_id=user.id, level_id=level_id, status="unlocked")
        db.add(prog)

    if passed and not prog.forensics_completed:
        prog.forensics_completed = True
        user.total_xp += 100
        db.commit()

    return {
        "passed": passed,
        "correct_count": correct_count,
        "total_questions": len(questions),
        "xp_gained": 100 if passed else 0
    }
