from tortoise import fields, models
import uuid

class Project(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    name = fields.CharField(max_length=255)
    description = fields.TextField(null=True)

    org = fields.ForeignKeyField(
        'models.Organization',
        related_name='projects',
        on_delete=fields.CASCADE
    )

    created_by = fields.ForeignKeyField(
        'models.User',
        related_name='created_projects',
        on_delete=fields.SET_NULL,
        null=True
    )

    is_archieved = fields.BooleanField(default=False)

    createdAt = fields.DatetimeField(auto_now_add=True)
    updatedAt = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "projects"
        indexes = [
            ("org",),
            ("org", "is_archieved"),
        ]