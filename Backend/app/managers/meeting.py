from datetime import datetime
from typing import Any, Dict, List

from app.exceptions import BadRequestException, ForbiddenException
from app.models import Meeting, Organization, User, Membership
from app.models.membership import MembershipStatus
from app.managers.notification import NotificationManager
from app.core.websocket_manager import websocket_manager
from tortoise.expressions import Q


class MeetingManager:
    @classmethod
    async def create_meeting(
        cls,
        org_id: str,
        creator_user_id: str,
        payload: Dict[str, Any],
    ) -> Meeting:
        title = (payload.get("title") or "").strip()
        description = (payload.get("description") or "").strip() or None
        google_meet_link = (payload.get("google_meet_link") or "").strip()
        start_time_str = payload.get("start_time")
        end_time_str = payload.get("end_time")
        participant_ids: List[str] = payload.get("participant_ids") or []

        if not title:
            raise BadRequestException("Title is required.")
        if not google_meet_link:
            raise BadRequestException("Google Meet link is required.")
        if not start_time_str or not end_time_str:
            raise BadRequestException("Start and end time are required.")

        try:
            start_time = datetime.fromisoformat(start_time_str)
            end_time = datetime.fromisoformat(end_time_str)
        except Exception:
            raise BadRequestException("Invalid start_time or end_time format. Use ISO 8601.")

        if end_time <= start_time:
            raise BadRequestException("End time must be after start time.")

        org = await Organization.get_or_none(id=org_id)
        if not org:
            raise BadRequestException("Organization not found.")

        creator = await User.get_or_none(id=creator_user_id)
        if not creator:
            raise BadRequestException("User not found.")

        membership = await Membership.get_or_none(
            userId=creator_user_id,
            organizationId=org_id,
            status=MembershipStatus.ACTIVE,
        )
        if not membership:
            raise ForbiddenException("You are not an active member of this organization.")

        if participant_ids:
            count = await Membership.filter(
                userId__in=participant_ids,
                organizationId=org_id,
                status=MembershipStatus.ACTIVE,
            ).count()
            if count != len(set(participant_ids)):
                raise BadRequestException(
                    "One or more participants are not active members of this organization."
                )

        meeting = await Meeting.create(
            org=org,
            created_by=creator,
            title=title,
            description=description,
            google_meet_link=google_meet_link,
            start_time=start_time,
            end_time=end_time,
            participant_ids=participant_ids,
        )

        participant_set = set(participant_ids or [])
        participant_set.add(creator_user_id)

        creator_name = (
            f"{getattr(creator, 'firstName', '')} {getattr(creator, 'lastName', '')}".strip()
            or getattr(creator, "email", None)
            or "Someone"
        )

        for uid in participant_set:
            notification = await NotificationManager.create(
                user_id=str(uid),
                type_val="meeting",
                title="New meeting scheduled",
                message=f"{creator_name} scheduled a meeting '{title}' in {org.name}.",
                metadata={
                    "org_id": str(org.id),
                    "org_name": org.name,
                    "meeting_id": str(meeting.id),
                    "title": title,
                    "start_time": start_time.isoformat(),
                    "end_time": end_time.isoformat(),
                    "google_meet_link": google_meet_link,
                    "created_by_name": creator_name,
                },
            )

            notification_data = {
                "id": str(notification.id),
                "type": "meeting",
                "title": notification.title,
                "message": notification.message,
                "metadata": notification.metadata or {},
                "read": notification.read,
                "created_at": notification.created_at.isoformat() if notification.created_at else None,
            }
            await websocket_manager.send_notification(str(uid), notification_data)

        return meeting

    @classmethod
    async def list_user_meetings(
        cls,
        user_id: str,
        from_iso: str | None = None,
        to_iso: str | None = None,
    ) -> List[Dict[str, Any]]:
        query = Meeting.filter(
            Q(created_by_id=user_id) | Q(participant_ids__contains=[user_id])
        )

        if from_iso:
            try:
                from_dt = datetime.fromisoformat(from_iso)
                query = query.filter(end_time__gte=from_dt)
            except Exception:
                pass

        if to_iso:
            try:
                to_dt = datetime.fromisoformat(to_iso)
                query = query.filter(start_time__lte=to_dt)
            except Exception:
                pass

        try:
            meetings = await query.order_by("start_time").all().prefetch_related("org", "created_by")
        except Exception as e:  # pragma: no cover - defensive
            if "UndefinedTableError" in type(e).__name__ or 'relation "meetings" does not exist' in str(e):
                return []
            raise

        result: List[Dict[str, Any]] = []
        for m in meetings:
            result.append(
                {
                    "id": str(m.id),
                    "org_id": str(m.org_id),
                    "org_name": m.org.name if m.org else None,
                    "title": m.title,
                    "description": m.description,
                    "google_meet_link": m.google_meet_link,
                    "start_time": m.start_time.isoformat(),
                    "end_time": m.end_time.isoformat(),
                    "created_by": {
                        "id": str(m.created_by_id) if m.created_by_id else None,
                        "firstName": getattr(m.created_by, "firstName", None) if m.created_by else None,
                        "lastName": getattr(m.created_by, "lastName", None) if m.created_by else None,
                        "email": getattr(m.created_by, "email", None) if m.created_by else None,
                    },
                    "participant_ids": m.participant_ids or [],
                }
            )
        return result

