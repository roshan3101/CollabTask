from app.core.config import settings
import urllib.parse
import logging

logger = logging.getLogger(__name__)

# Build database connection
encoded_password = urllib.parse.quote(settings.POSTGRES_PASSWORD or "", safe="")

if settings.USE_CLOUD_SQL_SOCKET:
    # Cloud SQL Unix socket - use credentials dict for proper handling
    DB_CONNECTION = {
        "engine": "tortoise.backends.asyncpg",
        "credentials": {
            "database": settings.POSTGRES_DB,
            "user": settings.POSTGRES_USER,
            "password": settings.POSTGRES_PASSWORD,
            "host": settings.POSTGRES_HOST,
            "port": 5432,
            "ssl": False,
        }
    }
    logger.info(f"Using Cloud SQL socket: {settings.POSTGRES_HOST}")
else:
    # Standard TCP connection (local dev)
    DB_CONNECTION = f"postgres://{settings.POSTGRES_USER}:{encoded_password}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
    logger.info(f"Using TCP connection: {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}")

TORTOISE_ORM = {
    "connections": {"default": DB_CONNECTION},
    "apps": {
        "models": {
            "models": ["app.models", "aerich.models"],
            "default_connection": "default",
        },
    }
}