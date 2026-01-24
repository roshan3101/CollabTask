import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

class Config:
    def __init__(self):
        self.POSTGRES_DB = os.getenv("POSTGRES_DB")
        self.POSTGRES_USER = os.getenv("POSTGRES_USER")
        self.POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
        self.POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
        self.POSTGRES_HOST = os.getenv("POSTGRES_HOST")

        # Check if using Cloud SQL Unix socket
        self.USE_CLOUD_SQL_SOCKET = self.POSTGRES_HOST and self.POSTGRES_HOST.startswith("/cloudsql/")
        
        # Build DATABASE_URL for standard connections (used by some tools)
        encoded_password = urllib.parse.quote(self.POSTGRES_PASSWORD or "", safe="")
        if self.USE_CLOUD_SQL_SOCKET:
            # For logging/reference only - actual connection uses DB_CONFIG
            self.DATABASE_URL = f"postgres://{self.POSTGRES_USER}:***@unix:{self.POSTGRES_HOST}/{self.POSTGRES_DB}"
        else:
            self.DATABASE_URL = f"postgres://{self.POSTGRES_USER}:{encoded_password}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

        self.JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_secret_key")

        self.environment = os.getenv("ENVIRONMENT", "development")

        self.SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
        self.FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@collabtask.com")
        self.FROM_NAME = os.getenv("FROM_NAME", "CollabTask")

        self.REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
        self.REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
        self.REDIS_DB = int(os.getenv("REDIS_DB", 0))
        
        cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
        self.CORS_ORIGINS = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]

settings = Config()