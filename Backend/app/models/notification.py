from tortoise import fields
from tortoise.models import Model
from enum import Enum
import uuid


class NotificationType(str, Enum):
    ORG_INVITE = "org_invite"

class Notification(Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    user_id = fields.UUIDField(index=True)
    type = fields.CharEnumField(enum_type=NotificationType)
    title = fields.CharField(max_length=512)
    message = fields.TextField()
    metadata = fields.JSONField(null=True) 
    read = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "notifications"

    def __str__(self):
        return f"{self.type} for user {self.user_id}"
