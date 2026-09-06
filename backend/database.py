from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings
import os

db_url = settings.DATABASE_URL

if db_url.startswith("postgresql"):
    try:
        import psycopg2
        temp_engine = create_engine(db_url, connect_args={"connect_timeout": 2})
        with temp_engine.connect() as conn:
            pass
        temp_engine.dispose()
    except Exception:
        # Fallback to SQLite when PostgreSQL server is unreachable
        sqlite_file = os.path.join(os.path.dirname(__file__), "cloudseclab.db")
        db_url = f"sqlite:///{sqlite_file}"

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
