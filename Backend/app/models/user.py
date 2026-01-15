from tortoise import fields
from tortoise.models import Model
import uuid

class User(Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    firstName = fields.CharField(max_length=255)
    lastName = fields.CharField(max_length=255)
    email = fields.CharField(max_length=255, unique=True)
    password = fields.CharField(max_length=255)

    isVerified = fields.BooleanField(default=False)

    createdAt = fields.DatetimeField(auto_now_add=True)
    updatedAt = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "users"

    def __str__(self):
        return self.email

    def __repr__(self):
        return f"<User {self.email}>"

    def __hash__(self):
        return hash(self.id)