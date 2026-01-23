from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Request
from fastapi.responses import JSONResponse
import logging
import json

from app.dependencies import require_user
from app.utils import ApiResponse
from app.core.chat_manager import chat_manager
from app.core.security import decode_access_token
from app.core.websocket_manager import websocket_manager
from app.managers.notification import NotificationManager
from app.models import Project, Membership, ChatMessage, User
from app.models.membership import MembershipStatus
from app.exceptions import BadRequestException, ForbiddenException


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.get("/organizations/{org_id}/projects/{project_id}/messages")
async def list_chat_messages(
    org_id: str,
    project_id: str,
    request: Request,
    limit: int = 50,
):
    user = require_user(request)
    user_id = str(user.get("user_id"))

    membership = await Membership.get_or_none(
        userId=user_id,
        organizationId=org_id,
        status=MembershipStatus.ACTIVE,
    )
    if not membership:
        raise ForbiddenException("You are not a member of this organization")

    project = await Project.get_or_none(id=project_id, org_id=org_id)
    if not project:
        raise BadRequestException("Project not found in this organization")

    qs = (
        ChatMessage.filter(org_id=org_id, project_id=project_id)
        .order_by("-createdAt")
        .limit(limit)
    )
    messages = await qs.all().prefetch_related("user")

    data = [
        {
            "id": str(m.id),
            "content": m.content,
            "createdAt": m.createdAt.isoformat(),
            "user": {
                "id": str(m.user_id) if m.user_id else None,
                "firstName": getattr(m.user, "firstName", None) if m.user else None,
                "lastName": getattr(m.user, "lastName", None) if m.user else None,
                "email": getattr(m.user, "email", None) if m.user else None,
            },
        }
        for m in reversed(messages)
    ]

    content = ApiResponse(success=True, message="Messages fetched", data=data)
    return JSONResponse(content=content, status_code=200)


async def get_user_from_token(token: str):
    try:
        payload = decode_access_token(token)
        if not payload:
            return None

        user_id = payload.get("sub")
        if not user_id:
            return None

        user = await User.get_or_none(id=user_id)
        return user
    except Exception as e:
        logger.error(f"Error decoding chat WebSocket token: {e}")
        return None


@router.websocket("/ws")
async def chat_websocket(
    websocket: WebSocket,
    org_id: str = Query(...),
    project_id: str = Query(...),
    token: str = Query(...),
):
    await websocket.accept()

    user = await get_user_from_token(token)
    if not user:
        await websocket.close(code=1008, reason="Unauthorized")
        return

    user_id = str(user.id)

    project = await Project.get_or_none(id=project_id, org_id=org_id)
    if not project:
        await websocket.close(code=1008, reason="Invalid project")
        return

    membership = await Membership.get_or_none(
        userId=user_id,
        organizationId=org_id,
        status=MembershipStatus.ACTIVE,
    )
    if not membership:
        await websocket.close(code=1008, reason="Not organization member")
        return

    room_id = f"{org_id}:{project_id}"

    await chat_manager.connect(websocket, room_id)

    try:
        await websocket.send_json({"type": "connected"})

        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except Exception:
                continue

            if data.get("type") != "chat_message":
                continue

            content = (data.get("content") or "").strip()
            if not content:
                continue

            msg = await ChatMessage.create(
                org_id=org_id,
                project_id=project_id,
                user_id=user_id,
                content=content,
            )

            payload = {
                "type": "chat_message",
                "message": {
                    "id": str(msg.id),
                    "content": msg.content,
                    "createdAt": msg.createdAt.isoformat(),
                    "user": {
                        "id": user_id,
                        "firstName": getattr(user, "firstName", None),
                        "lastName": getattr(user, "lastName", None),
                        "email": getattr(user, "email", None),
                    },
                },
            }
            await chat_manager.broadcast_message(room_id, payload)

            member_ids = await Membership.filter(
                organizationId=org_id,
                status=MembershipStatus.ACTIVE,
            ).values_list("userId", flat=True)

            sender_name = (
                f"{getattr(user, 'firstName', '')} {getattr(user, 'lastName', '')}".strip()
                or getattr(user, "email", None)
                or "Someone"
            )

            preview = content if len(content) <= 80 else content[:77] + "..."

            for uid in member_ids:
                uid_str = str(uid)
                if uid_str == user_id:
                    continue

                notification = await NotificationManager.create(
                    user_id=uid_str,
                    type_val="chat",
                    title="New project message",
                    message=f"{sender_name}: {preview}",
                    metadata={
                        "org_id": org_id,
                        "project_id": project_id,
                        "project_name": project.name,
                        "sender_id": user_id,
                        "sender_name": sender_name,
                        "message_preview": preview,
                    },
                )

                notification_data = {
                    "id": str(notification.id),
                    "type": "chat",
                    "title": notification.title,
                    "message": notification.message,
                    "metadata": notification.metadata or {},
                    "read": notification.read,
                    "created_at": notification.created_at.isoformat()
                    if notification.created_at
                    else None,
                }
                await websocket_manager.send_notification(uid_str, notification_data)

    except WebSocketDisconnect:
        chat_manager.disconnect(websocket, room_id)
    except Exception as e:
        logger.error(f"Chat websocket error: {e}")
        chat_manager.disconnect(websocket, room_id)
        try:
            await websocket.close()
        except Exception:
            pass

