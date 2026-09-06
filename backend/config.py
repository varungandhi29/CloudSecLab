try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic.v1 import BaseSettings
    except ImportError:
        from pydantic import BaseSettings
import os

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://cloudseclab:password@localhost:5432/cloudseclab"
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = "super-secret-key-cloudseclab-2026-key-phrase"
    PUBLIC_KEY: str = "dev-public-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    LOCALSTACK_ENDPOINT: str = "http://localhost:4566"
    FRONTEND_URL: str = "http://localhost:3000"
    CONTENT_DIR: str = r"c:\Users\DELL\Desktop\CloudSecLab\content" if os.path.exists(r"c:\Users\DELL\Desktop\CloudSecLab\content") else "./content"
    CERTIFICATES_DIR: str = r"c:\Users\DELL\Desktop\CloudSecLab\output\certificates" if os.path.exists(r"c:\Users\DELL\Desktop\CloudSecLab\output") else "./output/certificates"
    LAB_SESSION_TIMEOUT_MINUTES: int = 60
    SEED_MODE: bool = False

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
