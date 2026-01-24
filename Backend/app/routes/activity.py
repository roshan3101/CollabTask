from fastapi import APIRouter, Depends, Request, Query
from fastapi.responses import JSONResponse
from typing import Optional
from app.dependencies import require_user, require_org_membership, require_role
from app.utils import ApiResponse
from app.managers.activity import ActivityManager

router = APIRouter(
    prefix="/organizations/{org_id}/activities",
    tags=["Activities"]
)

@router.get("")
@router.get("/")
async def get_organization_activities(
    org_id: str,
    request: Request,
    user=Depends(require_user),
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["admin", "owner"])),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(50, ge=1, le=100, description="Number of items per page (max 100)"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type (task, project, organization)"),
    action_type: Optional[str] = Query(None, description="Filter by action type")
):
    result = await ActivityManager.get_organization_activities(
        org_id=org_id,
        user_id=str(user.get('user_id')),
        page=page,
        page_size=page_size,
        entity_type=entity_type,
        action_type=action_type
    )
    content = ApiResponse(success=True, message="Activities retrieved successfully", data=result)
    return JSONResponse(content=content, status_code=200)
