import os
import sys
import uuid
import secrets
import json
import logging
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
from config import settings
from models.user import User
from models.certificate import Certificate
from models.progress import LevelProgress
from services.auth_service import get_password_hash
from services.certificate_service import CertificateService

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger('seed')

def run_seed():
    logger.info('Initializing database schema...')
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        levels_dir = os.path.join(settings.CONTENT_DIR, 'levels')
        if os.path.exists(levels_dir):
            level_files = [f for f in os.listdir(levels_dir) if f.startswith('level_') and f.endswith('.json')]
            logger.info('Curriculum verification: Found %d level definition files in %s', len(level_files), levels_dir)
        else:
            logger.warning('Curriculum levels directory not found at: %s', levels_dir)

        verification_id = 'CSL-2026-BGN-98F2A10B'
        existing_cert = db.query(Certificate).filter(Certificate.verification_id == verification_id).first()
        if not existing_cert:
            try:
                logger.info('Seeding initial public verification certificate: %s', verification_id)
                sample_user = db.query(User).filter(User.username == 'alex_vance').first()
                if not sample_user:
                    sample_user = User(
                        id=str(uuid.uuid4()),
                        username='alex_vance',
                        email='alex.vance@cloudseclab.io',
                        full_name='Alex Vance',
                        password_hash=get_password_hash(secrets.token_urlsafe(16)),
                        total_xp=2500,
                        current_level=10,
                        country='US'
                    )
                    db.add(sample_user)
                    db.commit()
                    db.refresh(sample_user)

                pdf_path = CertificateService.generate_pdf(
                    verification_id=verification_id,
                    full_name='Alex Vance',
                    cert_type='beginner',
                    score=96.5
                )
                cert = Certificate(
                    id=str(uuid.uuid4()),
                    user_id=sample_user.id,
                    certificate_type='beginner',
                    verification_id=verification_id,
                    issued_at=datetime.utcnow(),
                    user_full_name='Alex Vance',
                    exam_score=96.5,
                    is_valid=True,
                    pdf_path=pdf_path
                )
                db.add(cert)
                db.commit()
                logger.info('Starter certificate record created and verified successfully.')
            except Exception as cert_err:
                logger.warning('Could not generate sample certificate during seeding: %s', cert_err)
                db.rollback()
        else:
            logger.info('Starter certificate %s already exists in database. Skipping.', verification_id)

        if settings.SEED_DEMO_DATA:
            logger.info('SEED_DEMO_DATA is enabled. Checking demo account...')
            demo_user = db.query(User).filter(User.username == 'demo_operator').first()
            if not demo_user:
                random_pwd = secrets.token_urlsafe(16)
                demo_user = User(
                    id=str(uuid.uuid4()),
                    username='demo_operator',
                    email='demo@cloudseclab.io',
                    full_name='Demo Security Operator',
                    password_hash=get_password_hash(random_pwd),
                    total_xp=500,
                    current_level=5,
                    streak_days=3,
                    country='US',
                    bio='Cloud Security Demonstration Profile'
                )
                db.add(demo_user)
                db.commit()
                db.refresh(demo_user)
                logger.info('=' * 60)
                logger.info('DEMO OPERATOR CREATED:')
                logger.info('Username: demo_operator')
                logger.info('Generated Password: %s', random_pwd)
                logger.info('=' * 60)
            else:
                logger.info('Demo user demo_operator already exists. Preserving existing account.')
        else:
            logger.info('Production mode: Demo account seeding is disabled (SEED_DEMO_DATA=false).')

        logger.info('Database initialization and idempotent seeding complete.')
    except Exception as e:
        logger.error('Error during database seeding: %s', e)
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == '__main__':
    run_seed()
