from tortoise import fields, models
import uuid
from datetime import datetime, timedelta, timezone

from app.constants import AuthConstants

class Auth(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    otp = fields.CharField(max_length=6)

    userId = fields.UUIDField(null=False)

    createdAt = fields.DatetimeField(auto_now_add=True)
    updatedAt = fields.DatetimeField(auto_now=True)

    def is_expired(self):
        expiry_time = self.createdAt + timedelta(
            minutes = AuthConstants.OTP_EXPIRY_TIME
        )

        return datetime.now(timezone.utc) > expiry_time

