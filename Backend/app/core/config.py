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

settings = Config()