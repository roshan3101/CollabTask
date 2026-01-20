from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse

from app.dependencies import require_user
from app.utils import ApiResponse
from app.managers.common import CommonManager

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