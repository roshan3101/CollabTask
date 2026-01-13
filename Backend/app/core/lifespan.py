from contextlib import asynccontextmanager
from tortoise import Tortoise
from fastapi import FastAPI
from app.core.db import TORTOISE_ORM

async def init_db(*args, **kwargs):
    await Tortoise.init(TORTOISE_ORM)

async def close_db(*args, **kwargs):
    await Tortoise.close_connections()


on_startup = [
    init_db
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