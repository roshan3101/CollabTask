from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import api_router
from app.routes.websocket import websocket_notifications
from app.core.lifespan import lifespan
from app.core.config import settings
from app.middlewares.authentication import AuthMiddleware
from app.observability.logging import RequestIDMiddleware

app = FastAPI(lifespan=lifespan)

app.add_middleware(AuthMiddleware)

app.add_middleware(RequestIDMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

app.websocket("/ws/notifications")(websocket_notifications)


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}
