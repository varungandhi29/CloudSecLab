from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, JSON
from datetime import datetime
import uuid
from database import Base

class ExamAttempt(Base):
    __tablename__ = "exam_attempts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    exam_id = Column(String, nullable=False)
    attempt_number = Column(Integer, nullable=False)
    status = Column(String, default="in_progress")  # in_progress | passed | failed | timed_out
    started_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    theory_score = Column(Float, nullable=True)
    practical_score = Column(Float, nullable=True)
    total_score = Column(Float, nullable=True)
    time_taken_seconds = Column(Integer, nullable=True)
    answers = Column(JSON, nullable=True)
    passed = Column(Boolean, nullable=True)
    admin_unlock_required = Column(Boolean, default=False)
