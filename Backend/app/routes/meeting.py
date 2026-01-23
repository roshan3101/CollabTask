from fastapi import APIRouter, Request, Query
from fastapi.responses import JSONResponse

from app.dependencies import require_user
from app.utils import ApiResponse
from app.managers.meeting import MeetingManager


router = APIRouter(
    prefix="/meetings",
    tags=["Meetings"],
)


@router.post("/organizations/{org_id}")
async def create_meeting(
    org_id: str,
    request: Request,
):
    user = require_user(request)
    user_id = str(user.get("user_id"))

    payload = await request.json()
    meeting = await MeetingManager.create_meeting(org_id, user_id, payload)

    content = ApiResponse(
        success=True,
        message="Meeting created successfully",
        data={"id": str(meeting.id)},
    )
    return JSONResponse(content=content, status_code=201)


@router.get("/my")
async def list_my_meetings(
    request: Request,
    from_time: str | None = Query(None),
    to_time: str | None = Query(None),
):
    user = require_user(request)
    user_id = str(user.get("user_id"))

    meetings = await MeetingManager.list_user_meetings(user_id, from_time, to_time)
    content = ApiResponse(
        success=True,
        message="Meetings fetched successfully",
        data=meetings,
    )
    return JSONResponse(content=content, status_code=200)

