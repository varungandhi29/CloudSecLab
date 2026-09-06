from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, ForeignKey
from datetime import datetime
import uuid
from database import Base

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    certificate_type = Column(String, nullable=False)  # beginner | intermediate | advanced | master
    verification_id = Column(String, unique=True, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    user_full_name = Column(String, nullable=False)
    exam_score = Column(Float, nullable=False)
    time_to_complete_days = Column(Integer, nullable=False, default=1)
    is_valid = Column(Boolean, default=True)
    pdf_path = Column(String, nullable=True)
