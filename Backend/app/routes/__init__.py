from fastapi import APIRouter
from .auth import router as auth_router
from .organization import router as organization_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(organization_router)