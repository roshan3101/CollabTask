from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import api_router
from app.core.lifespan import lifespan
from app.middlewares.authentication import AuthMiddleware
from app.observability.logging import RequestIDMiddleware

app = FastAPI(lifespan=lifespan)

# IMPORTANT: Middleware is applied in REVERSE order of addition
# Last middleware added = first to execute (outermost)

# Add middlewares in order from innermost to outermost
# AuthMiddleware - closest to routes
app.add_middleware(AuthMiddleware)

# RequestIDMiddleware - logs requests
app.add_middleware(RequestIDMiddleware)

# CORSMiddleware - must be outermost (added last)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}
