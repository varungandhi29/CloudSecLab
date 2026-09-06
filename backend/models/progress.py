from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey
from datetime import datetime
import uuid
from database import Base

class LevelProgress(Base):
    __tablename__ = "level_progress"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    level_id = Column(Integer, nullable=False, index=True)
    status = Column(String, default="locked")  # locked | unlocked | completed
    theory_completed = Column(Boolean, default=False)
    demo_completed = Column(Boolean, default=False)
    lab_completed = Column(Boolean, default=False)
    problem_solving_score = Column(Float, nullable=True)
    forensics_completed = Column(Boolean, default=False)
    hints_used = Column(Integer, default=0)
    attempts = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)
    time_spent_seconds = Column(Integer, default=0)
