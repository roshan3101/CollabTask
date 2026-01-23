from tortoise import fields, models
import uuid


class ChatMessage(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)

    org = fields.ForeignKeyField(
        "models.Organization",
        related_name="chat_messages",
        on_delete=fields.CASCADE,
    )

    project = fields.ForeignKeyField(
        "models.Project",
        related_name="chat_messages",
        on_delete=fields.CASCADE,
    )

    user = fields.ForeignKeyField(
        "models.User",
        related_name="chat_messages",
        on_delete=fields.SET_NULL,
        null=True,
    )

    content = fields.TextField()

    createdAt = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "chat_messages"
        indexes = [
            ("org", "project", "createdAt"),
        ]

