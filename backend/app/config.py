import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "MindOS API"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    # Default to SQLite file in backend root if DATABASE_URL not set
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./mindos.db")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]
    SECRET_KEY: str = os.getenv("SECRET_KEY", "mindos-super-secret-key-for-development-2026")
    DEMO_USER_ID: int = 1

settings = Settings()
