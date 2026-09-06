from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from database import get_db
from models.user import User
from models.exam import ExamAttempt
from models.progress import LevelProgress
from models.certificate import Certificate
from api.auth import get_current_user
from services.exam_service import ExamService
from services.certificate_service import CertificateService
import redis

router = APIRouter()

class ExamSubmitRequest(BaseModel):
    answers: Dict[str, Any]

@router.get("")
def list_exams(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exam_ids = ["beginner_final", "intermediate_final", "advanced_final", "master_final"]
    results = []

    completed_levels = db.query(LevelProgress).filter(
        LevelProgress.user_id == user.id, LevelProgress.status == "completed"
    ).count()

    for eid in exam_ids:
        exam_data = ExamService.load_exam(eid)
        if not exam_data:
            continue

        unlock_level = exam_data.get("unlocks_after_level", 24)
        is_unlocked = completed_levels >= unlock_level

        attempts = db.query(ExamAttempt).filter(
            ExamAttempt.user_id == user.id, ExamAttempt.exam_id == eid
        ).order_by(ExamAttempt.attempt_number.desc()).all()

        results.append({
            "exam_id": eid,
            "title": exam_data["title"],
            "track": exam_data["track"],
            "duration_minutes": exam_data["duration_minutes"],
            "passing_score": exam_data["passing_score"],
            "unlocks_after_level": unlock_level,
            "is_unlocked": is_unlocked,
            "attempts_used": len(attempts),
            "max_attempts": exam_data.get("max_attempts", 2),
            "passed": any(a.passed for a in attempts),
            "latest_score": attempts[0].total_score if attempts else None
        })

    return results

@router.get("/{exam_id}")
def get_exam_detail(exam_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exam_data = ExamService.load_exam(exam_id)
    if not exam_data:
        raise HTTPException(status_code=404, detail="Exam not found")

    unlock_level = exam_data.get("unlocks_after_level", 24)
    completed_levels = db.query(LevelProgress).filter(
        LevelProgress.user_id == user.id, LevelProgress.status == "completed"
    ).count()

    if completed_levels < unlock_level:
        raise HTTPException(status_code=403, detail=f"Exam locked. Must complete {unlock_level} levels first.")

    return exam_data

@router.post("/{exam_id}/start")
def start_exam(exam_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exam_data = ExamService.load_exam(exam_id)
    if not exam_data:
        raise HTTPException(status_code=404, detail="Exam not found")

    attempts = db.query(ExamAttempt).filter(
        ExamAttempt.user_id == user.id, ExamAttempt.exam_id == exam_id
    ).all()

    attempt_num = len(attempts) + 1
    max_attempts = exam_data.get("max_attempts", 2)

    if attempt_num > max_attempts:
        admin_unlocked = any(a.admin_unlock_required is False for a in attempts)
        if not admin_unlocked:
            raise HTTPException(status_code=403, detail="Maximum attempts exceeded. Admin unlock required.")

    # Check active attempt
    active_attempt = db.query(ExamAttempt).filter(
        ExamAttempt.user_id == user.id, ExamAttempt.exam_id == exam_id, ExamAttempt.status == "in_progress"
    ).first()

    if not active_attempt:
        active_attempt = ExamAttempt(
            user_id=user.id,
            exam_id=exam_id,
            attempt_number=attempt_num,
            status="in_progress",
            started_at=datetime.utcnow()
        )
        db.add(active_attempt)
        db.commit()

    duration = exam_data.get("duration_minutes", 60)
    expires_at = active_attempt.started_at + timedelta(minutes=duration)

    return {
        "status": "in_progress",
        "attempt_id": active_attempt.id,
        "started_at": active_attempt.started_at,
        "expires_at": expires_at,
        "duration_minutes": duration
    }

@router.get("/{exam_id}/status")
def get_exam_status(exam_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exam_data = ExamService.load_exam(exam_id)
    if not exam_data:
        raise HTTPException(status_code=404, detail="Exam not found")

    attempt = db.query(ExamAttempt).filter(
        ExamAttempt.user_id == user.id, ExamAttempt.exam_id == exam_id
    ).order_by(ExamAttempt.started_at.desc()).first()

    if not attempt:
        return {"status": "not_started"}

    duration = exam_data.get("duration_minutes", 60)
    expires_at = attempt.started_at + timedelta(minutes=duration)
    remaining_seconds = max(0, int((expires_at - datetime.utcnow()).total_seconds()))

    return {
        "status": attempt.status,
        "attempt_id": attempt.id,
        "started_at": attempt.started_at,
        "expires_at": expires_at,
        "remaining_seconds": remaining_seconds,
        "passed": attempt.passed,
        "total_score": attempt.total_score
    }

@router.post("/{exam_id}/submit")
def submit_exam(
    exam_id: str,
    req: ExamSubmitRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exam_data = ExamService.load_exam(exam_id)
    if not exam_data:
        raise HTTPException(status_code=404, detail="Exam not found")

    attempt = db.query(ExamAttempt).filter(
        ExamAttempt.user_id == user.id, ExamAttempt.exam_id == exam_id, ExamAttempt.status == "in_progress"
    ).first()

    if not attempt:
        # Fallback to latest attempt
        attempt = db.query(ExamAttempt).filter(
            ExamAttempt.user_id == user.id, ExamAttempt.exam_id == exam_id
        ).order_by(ExamAttempt.started_at.desc()).first()

    if not attempt:
        raise HTTPException(status_code=400, detail="No active exam attempt found to submit")

    score_result = ExamService.calculate_score(exam_data, req.answers)

    attempt.status = "passed" if score_result["passed"] else "failed"
    attempt.submitted_at = datetime.utcnow()
    attempt.theory_score = score_result["theory_score"]
    attempt.practical_score = score_result["practical_score"]
    attempt.total_score = score_result["total_score"]
    attempt.passed = score_result["passed"]
    attempt.answers = req.answers
    attempt.time_taken_seconds = int((datetime.utcnow() - attempt.started_at).total_seconds())

    cert_record = None
    if score_result["passed"]:
        user.total_xp += 500  # Exam bonus XP
        cert_type = exam_data.get("track", "beginner")
        v_id = CertificateService.generate_verification_id(cert_type)
        pdf_path = CertificateService.generate_pdf(
            verification_id=v_id,
            full_name=user.full_name,
            cert_type=cert_type,
            score=score_result["total_score"]
        )

        cert_record = Certificate(
            user_id=user.id,
            certificate_type=cert_type,
            verification_id=v_id,
            user_full_name=user.full_name,
            exam_score=score_result["total_score"],
            pdf_path=pdf_path
        )
        db.add(cert_record)

    db.commit()

    return {
        "status": attempt.status,
        "passed": score_result["passed"],
        "total_score": score_result["total_score"],
        "theory_score": score_result["theory_score"],
        "practical_score": score_result["practical_score"],
        "time_taken_seconds": attempt.time_taken_seconds,
        "certificate": {
            "verification_id": cert_record.verification_id,
            "certificate_type": cert_record.certificate_type,
            "issued_at": cert_record.issued_at
        } if cert_record else None
    }

@router.post("/{exam_id}/unlock")
def unlock_exam(exam_id: str, user_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempts = db.query(ExamAttempt).filter(
        ExamAttempt.user_id == user_id, ExamAttempt.exam_id == exam_id
    ).all()
    for a in attempts:
        a.admin_unlock_required = False
    db.commit()
    return {"message": "Exam attempt unlocked for user"}
