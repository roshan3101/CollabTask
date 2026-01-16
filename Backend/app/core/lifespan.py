from contextlib import asynccontextmanager
from tortoise import Tortoise
from fastapi import FastAPI
from app.core.db import TORTOISE_ORM
from app.observability import setup_logging, setup_metrics, setup_tracing

async def init_db(*args, **kwargs):
    await Tortoise.init(TORTOISE_ORM)

async def close_db(*args, **kwargs):
    await Tortoise.close_connections()

async def init_observability(*args, **kwargs):
    setup_logging()


on_startup = [
    init_db,
    init_observability,
]

on_shutdown = [
    close_db
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    for task in on_startup:
        await task(app)
    yield

    for task in on_shutdown:
        await task(app)