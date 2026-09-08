import os
import secrets
import logging

logger = logging.getLogger(__name__)

try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic.v1 import BaseSettings
    except ImportError:
        from pydantic import BaseSettings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_default_content = os.path.join(BASE_DIR, "content")
_default_certs = os.path.join(BASE_DIR, "output", "certificates")

class Settings(BaseSettings):
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://cloudseclab:password@localhost:5432/cloudseclab")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # SECRET_KEY must be provided via environment variable or .env
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    PUBLIC_KEY: str = os.getenv("PUBLIC_KEY", "dev-public-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    LOCALSTACK_ENDPOINT: str = os.getenv("LOCALSTACK_ENDPOINT", "http://localhost:4566")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    CONTENT_DIR: str = os.getenv("CONTENT_DIR", _default_content)
    CERTIFICATES_DIR: str = os.getenv("CERTIFICATES_DIR", _default_certs)
    LAB_SESSION_TIMEOUT_MINUTES: int = 60
    
    SEED_DEMO_DATA: bool = os.getenv("SEED_DEMO_DATA", "false").lower() in ("true", "1", "yes")

    class Config:
        env_file = ".env"
        extra = "allow"

    def __init__(self, **values):
        super().__init__(**values)
        if not self.SECRET_KEY:
            if self.ENVIRONMENT.lower() == "production":
                raise RuntimeError(
                    "FATAL SECURITY CONFIGURATION ERROR: SECRET_KEY environment variable is required in production mode. "
                    "Refusing to boot with an empty or missing signing secret."
                )
            else:
                # In development mode without a configured .env, generate an ephemeral random key and log a warning
                self.SECRET_KEY = secrets.token_urlsafe(32)
                logger.warning("No SECRET_KEY provided in development mode; generated ephemeral key: %s", self.SECRET_KEY[:8] + "...")

settings = Settings()
