from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from datetime import datetime
import uuid
from database import Base

class LabSession(Base):
    __tablename__ = "lab_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    level_id = Column(Integer, nullable=False)
    session_id = Column(String, unique=True)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    commands_run = Column(Integer, default=0)
    validated = Column(Boolean, default=False)
