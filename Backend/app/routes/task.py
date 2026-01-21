from fastapi import APIRouter, Request, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from app.dependencies import require_user, require_org_membership, require_role, project_access
from app.utils import ApiResponse
from app.managers.task import TaskManager
from app.schemas.task import CREATE_TASK_SCHEMA, UPDATE_TASK_SCHEMA, ASSIGN_TASK_SCHEMA, CHANGE_STATUS_SCHEMA
from typing import Optional

router = APIRouter(
    prefix="/organizations/{org_id}/projects/{project_id}/tasks",
    tags=["Tasks"]
)

@router.post('/')
async def create_task(
    org_id: str,
    project_id: str,
    request: Request,
    user=Depends(require_user),
    project=Depends(project_access())
):

    payload = await request.json()

    await TaskManager.validate_project_access(project_id, str(user.get('user_id')), require_write=True)

    result = await TaskManager.create_task(payload, project_id, str(user.get('user_id')))
    content = ApiResponse(success=True, message="Task created successfully", data=result)
    return JSONResponse(content=content, status_code=201)

@router.get('/')
async def list_tasks(
    org_id: str,
    project_id: str,
    request: Request,
    project=Depends(project_access()),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page (max 100)"),
    status: Optional[str] = Query(None, description="Filter by task status (todo, in_progress, review, done)"),
    assignee_id: Optional[str] = Query(None, description="Filter by assignee user ID"),
    sort_by: str = Query("updatedAt", description="Field to sort by (updatedAt, createdAt, title, status)"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)")
):

    result = await TaskManager.list_tasks_by_project(
        project_id=project_id,
        page=page,
        page_size=page_size,
        status=status,
        assignee_id=assignee_id,
        sort_by=sort_by,
        sort_order=sort_order
    )
    content = ApiResponse(success=True, message="Tasks retrieved successfully", data=result)
    return JSONResponse(content=content, status_code=200)

@router.get('/{task_id}')
async def get_task(
    org_id: str,
    project_id: str,
    task_id: str,
    request: Request,
    project=Depends(project_access())
):

    result = await TaskManager.get_task(task_id, project_id=project_id)
    content = ApiResponse(success=True, message="Task retrieved successfully", data=result)
    return JSONResponse(content=content, status_code=200)

@router.put('/{task_id}')
async def update_task(
    org_id: str,
    project_id: str,
    task_id: str,
    request: Request,
    user: dict = Depends(require_user),
    project=Depends(project_access())
):

    payload = await request.json()

    await TaskManager.validate_project_access(project_id, str(user.get('user_id')), require_write=True)

    result = await TaskManager.update_task(task_id, payload, str(user.get('user_id')), project_id=project_id)
    content = ApiResponse(success=True, message="Task updated successfully", data=result)
    return JSONResponse(content=content, status_code=200)

@router.put('/{task_id}/assign')
async def assign_task(
    org_id: str,
    project_id: str,
    task_id: str,
    request: Request,
    user: dict = Depends(require_user),
    project=Depends(project_access())
):

    payload = await request.json()

    await TaskManager.validate_project_access(project_id, str(user.id), require_write=True)

    result = await TaskManager.assign_task(task_id, payload, str(user.id), project_id=project_id)
    content = ApiResponse(success=True, message="Task assigned successfully", data=result)
    return JSONResponse(content=content, status_code=200)

@router.put('/{task_id}/status')
async def change_task_status(
    org_id: str,
    project_id: str,
    task_id: str,
    request: Request,
    user=Depends(require_user),
    project=Depends(project_access())
):

    payload = await request.json()

    await TaskManager.validate_project_access(project_id, str(user.get('user_id')), require_write=True)

    result = await TaskManager.change_task_status(task_id, payload, str(user.get('user_id')), project_id=project_id)
    content = ApiResponse(success=True, message="Task status updated successfully", data=result)
    return JSONResponse(content=content, status_code=200)