import sys
import os
import uuid
from datetime import datetime

sys.path.insert(0, os.path.abspath('backend'))

from database import SessionLocal, engine, Base
from models.user import User
from models.certificate import Certificate
from models.progress import LevelProgress
from services.auth_service import get_password_hash, create_access_token
from services.certificate_service import CertificateService

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Check or create user
user = db.query(User).filter(User.username == "alex_chen").first()
if not user:
    user = User(
        id=str(uuid.uuid4()),
        username="alex_chen",
        email="alex.chen@cloudseclab.io",
        full_name="Alex Chen",
        password_hash=get_password_hash("CloudSec2026!"),
        total_xp=2450,
        current_level=14,
        streak_days=7,
        country="US",
        bio="Cloud Security Analyst & Incident Responder"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
else:
    user.total_xp = 2450
    user.current_level = 14
    user.streak_days = 7
    user.full_name = "Alex Chen"
    user.bio = "Cloud Security Analyst & Incident Responder"
    db.commit()

# Seed level progress for levels 1 to 13
for lvl in range(1, 14):
    prog = db.query(LevelProgress).filter(LevelProgress.user_id == user.id, LevelProgress.level_id == lvl).first()
    if not prog:
        prog = LevelProgress(
            user_id=user.id,
            level_id=lvl,
            status="completed",
            theory_completed=True,
            lab_completed=True,
            hints_used=1 if lvl % 3 == 0 else 0,
            problem_solving_score=90.0,
            forensics_completed=True if lvl in [1, 5, 9] else False,
            completed_at=datetime.utcnow()
        )
        db.add(prog)

# Ensure level 14 is unlocked
prog14 = db.query(LevelProgress).filter(LevelProgress.user_id == user.id, LevelProgress.level_id == 14).first()
if not prog14:
    db.add(LevelProgress(user_id=user.id, level_id=14, status="unlocked", theory_completed=False, lab_completed=False))

# Seed verified certificate
verification_id = "CSL-2026-BGN-98F2A10B"
cert = db.query(Certificate).filter(Certificate.verification_id == verification_id).first()
pdf_path = CertificateService.generate_pdf(verification_id, user.full_name, "beginner", 96.5)

if not cert:
    cert = Certificate(
        id=str(uuid.uuid4()),
        user_id=user.id,
        certificate_type="beginner",
        verification_id=verification_id,
        issued_at=datetime.utcnow(),
        user_full_name=user.full_name,
        exam_score=96.5,
        is_valid=True,
        pdf_path=pdf_path
    )
    db.add(cert)

db.commit()

# Generate a JWT token for alex_chen
token = create_access_token({"sub": user.username, "user_id": user.id})
print("SEED_COMPLETE")
print(f"TOKEN={token}")
print(f"USER_ID={user.id}")
print(f"VERIFICATION_ID={verification_id}")
print(f"PDF_PATH={pdf_path}")
db.close()
