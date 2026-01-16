from tortoise import fields, models
import uuid
from enum import Enum

class EntityType(str, Enum):
    TASK = 'task'
    PROJECT = 'project'
    ORGANIZATION = 'organization'

class ActionType(str, Enum):
    # Task actions
    TASK_CREATED = 'task_created'
    TASK_STATUS_CHANGED = 'task_status_changed'
    TASK_DESCRIPTION_UPDATED = 'task_description_updated'
    TASK_ASSIGNED = 'task_assigned'
    TASK_UNASSIGNED = 'task_unassigned'
    TASK_TITLE_UPDATED = 'task_title_updated'

    # Project actions
    PROJECT_CREATED = 'project_created'
    PROJECT_UPDATED = 'project_updated'
    PROJECT_ARCHIVED = 'project_archived'
    PROJECT_RESTORED = 'project_restored'

    # Organization actions
    ORGANIZATION_CREATED = 'organization_created'
    ORGANIZATION_UPDATED = 'organization_updated'
    ORGANIZATION_DELETED = 'organization_deleted'
    MEMBER_ADDED = 'member_added'
    MEMBER_REMOVED = 'member_removed'
    MEMBER_ROLE_CHANGED = 'member_role_changed'

class Activity(models.Model):

    id = fields.UUIDField(pk=True, default=uuid.uuid4)

    # What entity was acted upon
    entity_type = fields.CharEnumField(enum_type=EntityType)
    entity_id = fields.UUIDField()

    # What action was performed
    action = fields.CharEnumField(enum_type=ActionType)

    # Additional data about the action (JSON)
    metadata = fields.JSONField(null=True)

    # Who performed the action
    user_id = fields.UUIDField()

    # Which organization this belongs to
    org_id = fields.UUIDField()

    # When it happened (immutable)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "activities"

    def __str__(self):
        return f"{self.action} on {self.entity_type} by user {self.user_id}"