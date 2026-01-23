from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from app.dependencies import require_user
from app.utils import ApiResponse
from app.managers.user import UserManager

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/me")
async def get_current_user(
    request: Request,
    user=Depends(require_user)
):
    result = await UserManager.get_user_profile(str(user.get('user_id')))
    content = ApiResponse(success=True, message="User profile retrieved successfully", data=result)
    return JSONResponse(content=content, status_code=200)

@router.put("/me")
async def update_current_user(
    request: Request,
    user=Depends(require_user)
):
    payload = await request.json()
    result = await UserManager.update_user_profile(str(user.get('user_id')), payload)
    content = ApiResponse(success=True, message="User profile updated successfully", data=result)
    return JSONResponse(content=content, status_code=200)
