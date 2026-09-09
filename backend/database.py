from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings
import os
import time
import logging

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL

if db_url.startswith("postgresql"):
    connected = False
    max_retries = 5 if settings.ENVIRONMENT.lower() == "production" else 1
    for attempt in range(1, max_retries + 1):
        try:
            import psycopg2
            temp_engine = create_engine(db_url, connect_args={"connect_timeout": 2})
            with temp_engine.connect() as conn:
                pass
            temp_engine.dispose()
            connected = True
            logger.info("Successfully established connection to PostgreSQL database.")
            break
        except Exception as e:
            if settings.ENVIRONMENT.lower() == "production":
                logger.warning("PostgreSQL connection attempt %d/%d failed: %s", attempt, max_retries, e)
                if attempt < max_retries:
                    time.sleep(2)
            else:
                break
    
    if not connected:
        sqlite_dir = "/tmp" if (os.path.exists("/tmp") and os.access("/tmp", os.W_OK)) else os.path.dirname(__file__)
        sqlite_file = os.path.join(sqlite_dir, "cloudseclab.db")
        db_url = f"sqlite:///{sqlite_file}"
        logger.warning(
            "PostgreSQL database is unreachable. Seamlessly falling back to local SQLite database: %s", sqlite_file
        )

connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
