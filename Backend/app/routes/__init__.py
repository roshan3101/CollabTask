from fastapi import APIRouter
from .auth import router as auth_router
from .organization import router as organization_router
from .project import router as project_router
from .common import router as common_router
from .task import router as task_router
from .user import router as user_router
from .search import router as search_router
from .activity import router as activity_router
from .notification import router as notification_router
from .meeting import router as meeting_router
from .comment import router as comment_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(organization_router)
api_router.include_router(project_router)
api_router.include_router(task_router)
api_router.include_router(common_router)
api_router.include_router(user_router)
api_router.include_router(search_router)
api_router.include_router(activity_router)
api_router.include_router(notification_router)
api_router.include_router(meeting_router)
api_router.include_router(comment_router)