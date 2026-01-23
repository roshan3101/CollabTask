from tortoise import fields, models
import uuid


class Comment(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)

    org = fields.ForeignKeyField(
        "models.Organization",
        related_name="comments",
        on_delete=fields.CASCADE,
    )

    project = fields.ForeignKeyField(
        "models.Project",
        related_name="comments",
        on_delete=fields.CASCADE,
    )

    user = fields.ForeignKeyField(
        "models.User",
        related_name="comments",
        on_delete=fields.SET_NULL,
        null=True,
    )

    content = fields.TextField()

    createdAt = fields.DatetimeField(auto_now_add=True)
    updatedAt = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "comments"
        indexes = [
            ("org", "project", "createdAt"),
        ]

