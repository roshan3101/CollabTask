from tortoise import fields, models
import uuid
from enum import Enum

class TaskStatus(str, Enum):
    TODO = 'todo'
    IN_PROGRESS = 'in_progress'
    REVIEW = 'review'
    DONE = 'done'

class Task(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    title = fields.CharField(max_length=255)
    description = fields.TextField(null=True)

    status = fields.CharEnumField(enum_type=TaskStatus, default=TaskStatus.TODO)

    assignee = fields.ForeignKeyField(
        'models.User',
        related_name='assigned_tasks',
        on_delete=fields.SET_NULL,
        null=True
    )

    project = fields.ForeignKeyField(
        'models.Project',
        related_name='tasks',
        on_delete=fields.CASCADE
    )

    version = fields.IntField(default=1)

    created_by = fields.ForeignKeyField(
        'models.User',
        related_name='created_tasks',
        on_delete=fields.SET_NULL,
        null=True
    )

    createdAt = fields.DatetimeField(auto_now_add=True)
    updatedAt = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "tasks"

    def __str__(self):
        return f"Task: {self.title} ({self.status})"