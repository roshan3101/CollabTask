from tortoise import fields, models
import uuid


class Meeting(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)

    org = fields.ForeignKeyField(
        "models.Organization",
        related_name="meetings",
        on_delete=fields.CASCADE,
    )

    created_by = fields.ForeignKeyField(
        "models.User",
        related_name="created_meetings",
        on_delete=fields.SET_NULL,
        null=True,
    )

    title = fields.CharField(max_length=255)
    description = fields.TextField(null=True)
    google_meet_link = fields.CharField(max_length=512)

    start_time = fields.DatetimeField()
    end_time = fields.DatetimeField()

    # list of user id strings
    participant_ids = fields.JSONField(null=True)

    createdAt = fields.DatetimeField(auto_now_add=True)
    updatedAt = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "meetings"
        indexes = [
            ("org", "start_time"),
        ]

