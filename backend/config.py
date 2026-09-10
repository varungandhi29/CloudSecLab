import os
import secrets
import logging
from dotenv import load_dotenv

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

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
_default_certs = "/tmp/certificates" if (os.path.exists("/tmp") and os.access("/tmp", os.W_OK)) else os.path.join(BASE_DIR, "output", "certificates")

class Settings(BaseSettings):
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://cloudseclab:password@localhost:5432/cloudseclab")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # SECRET_KEY / JWT_SECRET must be provided via environment variable or .env
    SECRET_KEY: str = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY", "")
    PUBLIC_KEY: str = os.getenv("PUBLIC_KEY", "dev-public-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    LOCALSTACK_ENDPOINT: str = os.getenv("LOCALSTACK_ENDPOINT", "http://localhost:4566")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://cloudseclab.vercel.app")
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")



    
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
            # Generate a secure ephemeral secret key to prevent startup crash-looping if env var is omitted
            self.SECRET_KEY = secrets.token_urlsafe(32)
            if self.ENVIRONMENT.lower() == "production":
                logger.warning(
                    "SECURITY NOTICE: SECRET_KEY environment variable was not set in production. "
                    "Generated secure ephemeral signing key: %s...", self.SECRET_KEY[:8]
                )
            else:
                logger.info("No SECRET_KEY provided in development mode; generated ephemeral key: %s...", self.SECRET_KEY[:8])

settings = Settings()
