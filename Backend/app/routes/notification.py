from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse

from app.dependencies import require_user
from app.utils import ApiResponse
from app.managers.notification import NotificationManager

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get("/")
async def list_notifications(
    user=Depends(require_user),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page (max 100)"),
    unread_only: bool = Query(False, description="Filter to unread only"),
):
    result = await NotificationManager.list_for_user(
        user_id=str(user.get("user_id")),
        page=page,
        page_size=page_size,
        unread_only=unread_only,
    )
    content = ApiResponse(
        success=True,
        message="Notifications retrieved successfully",
        data=result,
    )
    return JSONResponse(content=content, status_code=200)


@router.patch("/read-all")
async def mark_all_notifications_read(user=Depends(require_user)):
    result = await NotificationManager.mark_all_read(
        user_id=str(user.get("user_id")),
    )
    content = ApiResponse(success=True, message=result["message"])
    return JSONResponse(content=content, status_code=200)


@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    user=Depends(require_user),
):
    result = await NotificationManager.mark_read(
        notification_id=notification_id,
        user_id=str(user.get("user_id")),
    )
    content = ApiResponse(success=True, message=result["message"])
    return JSONResponse(content=content, status_code=200)
