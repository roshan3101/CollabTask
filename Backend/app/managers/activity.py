from app.models import Activity, EntityType, ActionType
from typing import Dict, Any, Optional
from app.constants import GeneralConstants

class ActivityManager:

    @classmethod
    async def log_activity(
        cls,
        entity_type: EntityType,
        entity_id: str,
        action: ActionType,
        user_id: str,
        org_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Activity:

        activity = await Activity.create(
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            metadata=metadata or {},
            user_id=user_id,
            org_id=org_id
        )
        return activity

    @classmethod
    async def get_entity_activities(
        cls,
        entity_type: EntityType,
        entity_id: str,
        limit: int = GeneralConstants.DEFAULT_ACTIVITY_LIMIT
    ) -> list:

        activities = await Activity.filter(
            entity_type=entity_type,
            entity_id=entity_id
        ).order_by('-created_at').limit(limit)

        return activities

    @classmethod
    async def get_org_activities(
        cls,
        org_id: str,
        entity_type: Optional[EntityType] = None,
        limit: int = GeneralConstants.ORG_ACTIVITY_LIMIT
    ) -> list:

        query = Activity.filter(org_id=org_id)
        if entity_type:
            query = query.filter(entity_type=entity_type)

        activities = await query.order_by('-created_at').limit(limit)
        return activities

    @classmethod
    async def get_user_activities(
        cls,
        user_id: str,
        org_id: Optional[str] = None,
        limit: int = GeneralConstants.DEFAULT_ACTIVITY_LIMIT
    ) -> list:

        query = Activity.filter(user_id=user_id)
        if org_id:
            query = query.filter(org_id=org_id)

        activities = await query.order_by('-created_at').limit(limit)
        return activities

    # Specific logging methods for different actions

    @classmethod
    async def log_task_created(
        cls,
        task_id: str,
        project_id: str,
        org_id: str,
        user_id: str,
        task_data: Dict[str, Any]
    ):
        metadata = {
            'project_id': project_id,
            'title': task_data.get('title'),
            'description': task_data.get('description'),
            'status': task_data.get('status'),
            'assignee_id': task_data.get('assignee_id')
        }
        await cls.log_activity(
            EntityType.TASK,
            task_id,
            ActionType.TASK_CREATED,
            user_id,
            org_id,
            metadata
        )

    @classmethod
    async def log_task_status_changed(
        cls,
        task_id: str,
        org_id: str,
        user_id: str,
        old_status: str,
        new_status: str
    ):
        metadata = {
            'old_status': old_status,
            'new_status': new_status
        }
        await cls.log_activity(
            EntityType.TASK,
            task_id,
            ActionType.TASK_STATUS_CHANGED,
            user_id,
            org_id,
            metadata
        )

    @classmethod
    async def log_task_description_updated(
        cls,
        task_id: str,
        org_id: str,
        user_id: str,
        old_description: str,
        new_description: str
    ):
        metadata = {
            'old_description': old_description,
            'new_description': new_description
        }
        await cls.log_activity(
            EntityType.TASK,
            task_id,
            ActionType.TASK_DESCRIPTION_UPDATED,
            user_id,
            org_id,
            metadata
        )

    @classmethod
    async def log_task_assigned(
        cls,
        task_id: str,
        org_id: str,
        user_id: str,
        assignee_id: str
    ):
        metadata = {
            'assignee_id': assignee_id
        }
        await cls.log_activity(
            EntityType.TASK,
            task_id,
            ActionType.TASK_ASSIGNED,
            user_id,
            org_id,
            metadata
        )

    @classmethod
    async def log_task_unassigned(
        cls,
        task_id: str,
        org_id: str,
        user_id: str,
        old_assignee_id: str
    ):
        metadata = {
            'old_assignee_id': old_assignee_id
        }
        await cls.log_activity(
            EntityType.TASK,
            task_id,
            ActionType.TASK_UNASSIGNED,
            user_id,
            org_id,
            metadata
        )

    @classmethod
    async def log_task_title_updated(
        cls,
        task_id: str,
        org_id: str,
        user_id: str,
        old_title: str,
        new_title: str
    ):
        metadata = {
            'old_title': old_title,
            'new_title': new_title
        }
        await cls.log_activity(
            EntityType.TASK,
            task_id,
            ActionType.TASK_TITLE_UPDATED,
            user_id,
            org_id,
            metadata
        )