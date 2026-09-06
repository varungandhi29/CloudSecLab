from sqlalchemy import Column, String, Boolean, DateTime, Integer
from datetime import datetime
import uuid
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    password_hash = Column(String, nullable=True)  # Nullable for OAuth SSO users
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    total_xp = Column(Integer, default=0)
    current_level = Column(Integer, default=1)
    streak_days = Column(Integer, default=0)
    last_activity = Column(DateTime, nullable=True)
    country = Column(String, nullable=True, default="US")
    bio = Column(String, nullable=True, default="Cloud Security Enthusiast")
    
    # OAuth Provider fields
    provider = Column(String, default="email")  # email | google | apple
    provider_id = Column(String, nullable=True)  # Google/Apple sub ID
    avatar_url = Column(String, nullable=True)
