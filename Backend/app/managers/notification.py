from app.models import Notification
from app.models.notification import NotificationType
from app.exceptions import NotFoundException
from app.utils.validator import Validator
from typing import Dict, Optional


class NotificationManager:

    @classmethod
    async def create(
        cls,
        user_id: str,
        type_val: str,
        title: str,
        message: str,
        metadata: Optional[Dict] = None,
    ) -> Notification:
        user_id = Validator.validate_uuid(user_id, "user_id")
        type_val = Validator.validate_enum(type_val, [NotificationType.ORG_INVITE.value], "type")
        title = Validator.validate_non_empty_string(title, "title", max_length=512)
        message = Validator.validate_non_empty_string(message, "message")

        notification = await Notification.create(
            user_id=user_id,
            type=type_val,
            title=title,
            message=message,
            metadata=metadata,
        )
        return notification

    @classmethod
    async def list_for_user(
        cls,
        user_id: str,
        page: int = 1,
        page_size: int = 50,
        unread_only: bool = False,
    ) -> Dict:
        user_id = Validator.validate_uuid(user_id, "user_id")
        page = Validator.validate_positive_integer(page, "page", min_value=1)
        page_size = Validator.validate_positive_integer(
            page_size, "page_size", min_value=1, max_value=100
        )

        query = Notification.filter(user_id=user_id)
        if unread_only:
            query = query.filter(read=False)

        total = await query.count()
        total_pages = (total + page_size - 1) // page_size if total else 0

        notifications = await query.order_by("-created_at").offset(
            (page - 1) * page_size
        ).limit(page_size)

        items = []
        for n in notifications:
            type_val = getattr(n.type, "value", n.type) or ""
            items.append({
                "id": str(n.id),
                "type": type_val,
                "title": n.title,
                "message": n.message,
                "metadata": n.metadata or {},
                "read": n.read,
                "created_at": n.created_at.isoformat() if n.created_at else None,
            })

        return {
            "notifications": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": total_pages,
            },
        }

    @classmethod
    async def mark_read(cls, notification_id: str, user_id: str) -> Dict:
        notification_id = Validator.validate_uuid(notification_id, "notification_id")
        user_id = Validator.validate_uuid(user_id, "user_id")

        notification = await Notification.get_or_none(
            id=notification_id,
            user_id=user_id,
        )
        if not notification:
            raise NotFoundException("Notification not found.")

        notification.read = True
        await notification.save()
        return {"message": "Notification marked as read."}

    @classmethod
    async def mark_all_read(cls, user_id: str) -> Dict:
        user_id = Validator.validate_uuid(user_id, "user_id")

        updated = await Notification.filter(user_id=user_id, read=False).update(read=True)
        return {"message": f"Marked {updated} notification(s) as read."}
