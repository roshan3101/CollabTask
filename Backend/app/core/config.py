import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    def __init__(self):
        self.POSTGRES_DB = os.getenv("POSTGRES_DB")
        self.POSTGRES_USER = os.getenv("POSTGRES_USER")
        self.POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
        self.POSTGRES_PORT = os.getenv("POSTGRES_PORT")
        self.POSTGRES_HOST = os.getenv("POSTGRES_HOST")

        self.DATABASE_URL = f"postgres://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

        self.JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_secret_key")

        self.environment = os.getenv("ENVIRONMENT", "development")

        self.AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
        self.AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
        self.AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
        self.FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@collabtask.com")
        self.FROM_NAME = os.getenv("FROM_NAME", "CollabTask")

        self.REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
        self.REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
        self.REDIS_DB = int(os.getenv("REDIS_DB", 0))
        
        self.CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}")
        self.CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}")

settings = Config()