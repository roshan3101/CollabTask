from tortoise import fields, models
import uuid

class TaskAssignee(models.Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    task = fields.ForeignKeyField(
        'models.Task',
        related_name='assignees',
        on_delete=fields.CASCADE
    )
    user = fields.ForeignKeyField(
        'models.User',
        related_name='task_assignments',
        on_delete=fields.CASCADE
    )
    assigned_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "task_assignees"
        unique_together = ("task", "user")
        indexes = [
            ("task",),
            ("user",),
        ]

    def __str__(self):
        return f"TaskAssignee: {self.task_id} -> {self.user_id}"
