from fastapi import APIRouter, Request, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from app.dependencies import require_org_membership, require_user, require_role, project_access
from app.utils import ApiResponse
from app.managers.project import ProjectManager

router = APIRouter(
    prefix="/organizations/{org_id}/projects",
    tags=["Projects"]
)

@router.post('/')
async def create_project(
    org_id: str,
    request: Request,
    user=Depends(require_user),
    membership=Depends(require_org_membership())
):
    payload = await request.json()
    result = await ProjectManager.create(payload, user.get('user_id'), membership)
    content = ApiResponse(success=True, message="Project created successfully", data=result)
    return JSONResponse(content=content, status_code=201)

@router.get('/')
async def list_projects(
    org_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["member", "admin", "owner"]))
):

    payload = {}
    result = await ProjectManager.list_all_projects(payload, membership, role)
    content = ApiResponse(success=True, message="Projects retrieved successfully", data=result)
    return JSONResponse(content=content, status_code=200)

@router.get('/archived')
async def list_archived_projects(
    org_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["admin", "owner"]))
):
    result = await ProjectManager.get_archived_projects(membership, role)
    content = ApiResponse(success=True, message="Archived projects retrieved successfully", data=result)
    return JSONResponse(content=content, status_code=200)

@router.get('/{project_id}')
async def get_project(
    org_id: str,
    project_id: str,
    request: Request,
    project=Depends(project_access())
):
    # project_access() already fetched and validated the project
    result = ProjectManager.get_project_from_orm(project)
    content = ApiResponse(success=True, message="Project retrieved successfully", data=result)
    return JSONResponse(content=content, status_code=200)

@router.put('/{project_id}')
async def update_project(
    org_id: str,
    project_id: str,
    request: Request,
    project=Depends(project_access())
):
    payload = await request.json()
    result = await ProjectManager.update_project(payload, project)
    content = ApiResponse(success=True, message="Project updated successfully", data=result)
    return JSONResponse(content=content, status_code=200)

@router.delete('/{project_id}')
async def delete_project(
    org_id: str,
    project_id: str,
    request: Request,
    user=Depends(require_user),
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["member", "admin", "owner"])),
    project=Depends(project_access())
):
    result = await ProjectManager.delete_project(project, role, user.get('user_id'))
    content = ApiResponse(success=True, message=result["message"])
    return JSONResponse(content=content, status_code=200)

@router.post('/{project_id}/restore')
async def restore_project(
    org_id: str,
    project_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["admin", "owner"]))
):
    """
    Restore an archived project - admin/owner only
    """
    result = await ProjectManager.restore_project(project_id, membership, role)
    content = ApiResponse(success=True, message="Project restored successfully", data=result)
    return JSONResponse(content=content, status_code=200)

@router.get('/{project_id}/analytics')
async def get_project_analytics(
    org_id: str,
    project_id: str,
    request: Request,
    project=Depends(project_access())
):
    result = await ProjectManager.get_project_analytics(project_id)
    content = ApiResponse(success=True, message="Project analytics retrieved successfully", data=result)
    return JSONResponse(content=content, status_code=200)