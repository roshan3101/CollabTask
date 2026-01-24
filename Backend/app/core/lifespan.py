from contextlib import asynccontextmanager
from tortoise import Tortoise
from fastapi import FastAPI
from app.core.db import TORTOISE_ORM
from app.observability import setup_logging
from app.core.redis_client import redis_client
import logging

logger = logging.getLogger(__name__)


async def init_db(*args, **kwargs):
    await Tortoise.init(TORTOISE_ORM)

async def close_db(*args, **kwargs):
    await Tortoise.close_connections()

async def init_observability(*args, **kwargs):
    setup_logging()

async def init_redis(*args, **kwargs):
    is_connected = await redis_client.ping()
    if is_connected:
        logger.info("Redis connection established")
    else:
        logger.warning("Redis connection failed - some features may not work")


on_startup = [
    init_db,
    init_observability,
    init_redis,
]

async def close_redis(*args, **kwargs):
    await redis_client.close()

on_shutdown = [
    close_db,
    close_redis,
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    for task in on_startup:
        await task(app)
    yield

    for task in on_shutdown:
        await task(app)