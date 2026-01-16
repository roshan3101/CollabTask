from tortoise import fields, models
from enum import Enum
from uuid import uuid4

class MembershipRole(str, Enum):
    MEMBER = 'member'
    ADMIN = 'admin'
    OWNER = 'owner'

class MembershipStatus(str, Enum):
    PENDING = 'pending'
    ACTIVE = 'active'
    SUSPENDED = 'suspended'

class Membership(models.Model):
    id = fields.UUIDField(pk=True, default=uuid4)
    userId = fields.UUIDField()
    organizationId = fields.UUIDField()
    role = fields.CharEnumField(enum_type=MembershipRole, default=MembershipRole.MEMBER)
    status = fields.CharEnumField(enum_type=MembershipStatus, default=MembershipStatus.PENDING)

    createdAt = fields.DatetimeField(auto_now_add=True)
    updatedAt = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "memberships"
        unique_together = ("userId", "organizationId")