from tortoise import fields
from tortoise.models import Model
import uuid
from datetime import datetime, timedelta, timezone
from app.constants import AuthConstants

class UserSessions(Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    userId = fields.UUIDField()
    refreshToken = fields.CharField(max_length=512)
    createdAt = fields.DatetimeField(auto_now_add=True)


    @property
    def is_expired(self) -> bool:
        expiry_time = self.createdAt + timedelta(days=AuthConstants.REFRESH_TOKEN_EXPIRE_DAYS)
        return datetime.now(timezone.utc) > expiry_time

    class Meta:
        table = "user_sessions"

    def __str__(self):
        return self.refreshToken