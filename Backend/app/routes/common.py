from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.responses import JSONResponse
from typing import Optional

from app.dependencies import require_user
from app.utils import ApiResponse
from app.managers.common import CommonManager
from app.managers.task import TaskManager
from app.managers.dashboard import DashboardManager

router = APIRouter(
    prefix='/common',
    tags=['common_for_org_and_project']
)

@router.get("/")
async def list_projects(
    request:Request,
    user_context = Depends(require_user)
): 
    result = await CommonManager.list_projects(user_context)
    content = ApiResponse(success=True, message="Fetched the projects successfully", data=result)
    return JSONResponse(
        content=content, status_code=200
    )

@router.get("/my-tasks")
async def list_my_tasks(
    request: Request,
    user=Depends(require_user),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page (max 100)"),
    status: Optional[str] = Query(None, description="Filter by task status (todo, in_progress, review, done)"),
    sort_by: str = Query("updatedAt", description="Field to sort by (updatedAt, createdAt, title, status)"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)")
):
    result = await TaskManager.list_my_tasks(
        user_id=str(user.get('user_id')),
        page=page,
        page_size=page_size,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order
    )
    content = ApiResponse(success=True, message="My tasks retrieved successfully", data=result)
    return JSONResponse(content=content, status_code=200)

@router.get("/dashboard/analytics")
async def get_dashboard_analytics(
    request: Request,
    user=Depends(require_user)
):
    result = await DashboardManager.get_dashboard_analytics(str(user.get('user_id')))
    content = ApiResponse(success=True, message="Dashboard analytics retrieved successfully", data=result)
    return JSONResponse(content=content, status_code=200)

@router.get("/dashboard/recent-projects")
async def get_recent_projects(
    request: Request,
    user=Depends(require_user),
    limit: int = Query(3, ge=1, le=10, description="Number of recent projects to return")
):
    result = await DashboardManager.get_recent_projects(str(user.get('user_id')), limit=limit)
    content = ApiResponse(success=True, message="Recent projects retrieved successfully", data=result)
    return JSONResponse(content=content, status_code=200)