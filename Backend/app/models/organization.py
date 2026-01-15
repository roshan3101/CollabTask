from tortoise import fields, models
from uuid import uuid4

class Organization(models.Model):
    id = fields.UUIDField(pk=True, default=uuid4)
    name = fields.CharField(max_length=255, unique=True)
    address = fields.CharField(max_length=512, null=True)
    website = fields.CharField(max_length=255, null=True)
    description = fields.TextField(null=True)

    createdAt = fields.DatetimeField(auto_now_add=True)
    updatedAt = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "organizations"