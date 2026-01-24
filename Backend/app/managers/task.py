from app.models import Task, Project, User, Membership, TaskAssignee
from app.models.membership import MembershipRole
from app.exceptions import (
    BadRequestException, NotFoundException, ConflictException, ForbiddenException
)
from app.schemas.task import (
    CREATE_TASK_SCHEMA, UPDATE_TASK_SCHEMA, ASSIGN_TASK_SCHEMA, CHANGE_STATUS_SCHEMA, 
    TaskSerializer, TaskListSerializer, TaskDetailSerializer, PaginatedResponse
)
from tortoise.transactions import in_transaction
from app.managers.activity import ActivityManager
from tortoise.exceptions import IntegrityError
from app.constants import GeneralConstants, ErrorMessages
from app.utils.validator import Validator
from typing import Optional
from math import ceil

class TaskManager:

    @classmethod
    async def create_task(cls, payload: dict, project_id: str, user_id: str):
        project_id = Validator.validate_uuid(project_id, "project_id")
        user_id = Validator.validate_uuid(user_id, "user_id")

        validated_data = CREATE_TASK_SCHEMA(**payload)

        if validated_data.status not in GeneralConstants.TASK_STATUSES:
            raise BadRequestException(ErrorMessages.INVALID_STATUS)


        Validator.validate_non_empty_string(validated_data.title, "title", max_length=255)

        project = await Project.get_or_none(id=project_id).select_related('org')
        if not project:
            raise NotFoundException(ErrorMessages.PROJECT_NOT_FOUND)
        
        if project.is_archieved:
            raise NotFoundException(ErrorMessages.PROJECT_ARCHIVED)

        task = await Task.create(
            title=validated_data.title,
            description=validated_data.description,
            status=validated_data.status,
            project=project,
            created_by_id=user_id
        )

        if validated_data.assignee_ids:
            for assignee_id_str in validated_data.assignee_ids:
                assignee_id = Validator.validate_uuid(assignee_id_str, "assignee_id")
                assignee = await User.get_or_none(id=assignee_id)
                if not assignee:
                    raise NotFoundException(ErrorMessages.ASSIGNEE_NOT_FOUND)
                await TaskAssignee.create(task=task, user=assignee)

        # Log activity (non-blocking - don't fail the request if logging fails)
        org_id = str(project.org_id)
        try:
            from app.models.activity import ActionType, EntityType
            await ActivityManager.create_activity(
                org_id=org_id,
                user_id=user_id,
                entity_type=EntityType.TASK.value,
                entity_id=str(task.id),
                action=ActionType.TASK_CREATED.value,
                metadata={
                    'title': validated_data.title,
                    'description': validated_data.description,
                    'status': validated_data.status,
                    'assignee_ids': validated_data.assignee_ids
                }
            )
        except Exception as e:
            # Log the error but don't fail the request - task was already created
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to log task creation activity: {e}", exc_info=True)

        result = await TaskSerializer.from_orm(task)
        return result.dict()

    @classmethod
    async def get_task(cls, task_id: str, project_id: Optional[str] = None):
        task_id = Validator.validate_uuid(task_id, "task_id")
        
        task = await Task.get_or_none(id=task_id).select_related('project', 'created_by')
        if not task:
            raise NotFoundException(ErrorMessages.TASK_NOT_FOUND)

        if project_id:
            project_id = Validator.validate_uuid(project_id, "project_id")
            if str(task.project_id) != project_id:
                raise NotFoundException(ErrorMessages.TASK_NOT_IN_PROJECT)
            
            # Check if project is archived
            if task.project.is_archieved:
                raise NotFoundException(ErrorMessages.PROJECT_ARCHIVED)

        result = await TaskDetailSerializer.from_orm(task)
        return result.dict()

    @classmethod
    async def update_task(cls, task_id: str, payload: dict, user_id: str, project_id: Optional[str] = None):
        task_id = Validator.validate_uuid(task_id, "task_id")
        user_id = Validator.validate_uuid(user_id, "user_id")
        if project_id:
            project_id = Validator.validate_uuid(project_id, "project_id")

        validated_data = UPDATE_TASK_SCHEMA(**payload)

        if validated_data.status and validated_data.status not in GeneralConstants.TASK_STATUSES:
            raise BadRequestException(ErrorMessages.INVALID_STATUS)

        if validated_data.title is not None:
            Validator.validate_non_empty_string(validated_data.title, "title", max_length=255)

        task = await Task.get_or_none(id=task_id).select_related('project')
        if not task:
            raise NotFoundException(ErrorMessages.TASK_NOT_FOUND)

        if project_id and str(task.project_id) != project_id:
            raise NotFoundException(ErrorMessages.TASK_NOT_IN_PROJECT)

        if task.project.is_archieved:
            raise NotFoundException(ErrorMessages.PROJECT_ARCHIVED)

        if task.version != validated_data.version:
            raise ConflictException(ErrorMessages.TASK_VERSION_MISMATCH)

        update_data = validated_data.dict(exclude_unset=True, exclude={'version', 'assignee_ids'})
        
        # Handle assignee_ids separately
        if 'assignee_ids' in validated_data.dict(exclude_unset=True):
            # Remove existing assignees
            await TaskAssignee.filter(task_id=task_id).delete()
            
            # Add new assignees
            if validated_data.assignee_ids:
                for assignee_id_str in validated_data.assignee_ids:
                    assignee_id = Validator.validate_uuid(assignee_id_str, "assignee_id")
                    assignee = await User.get_or_none(id=assignee_id)
                    if not assignee:
                        raise NotFoundException(ErrorMessages.ASSIGNEE_NOT_FOUND)
                    await TaskAssignee.create(task=task, user=assignee)

        if update_data:
            # Store old values for activity logging
            old_title = task.title
            old_description = task.description

            update_data['version'] = task.version + 1

            for key, value in update_data.items():
                setattr(task, key, value)
            await task.save()

            # Log activities for changes (non-blocking)
            org_id = str(task.project.org_id)
            try:
                from app.models.activity import ActionType, EntityType
                
                if 'title' in update_data and update_data['title'] != old_title:
                    await ActivityManager.create_activity(
                        org_id=org_id,
                        user_id=user_id,
                        entity_type=EntityType.TASK.value,
                        entity_id=task_id,
                        action=ActionType.TASK_TITLE_UPDATED.value,
                        metadata={
                            'old_title': old_title,
                            'new_title': update_data['title']
                        }
                    )

                if 'description' in update_data and update_data['description'] != old_description:
                    await ActivityManager.create_activity(
                        org_id=org_id,
                        user_id=user_id,
                        entity_type=EntityType.TASK.value,
                        entity_id=task_id,
                        action=ActionType.TASK_DESCRIPTION_UPDATED.value,
                        metadata={
                            'old_description': old_description or '',
                            'new_description': update_data['description'] or ''
                        }
                    )
            except Exception as e:
                # Log the error but don't fail the request - task was already updated
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to log task update activity: {e}", exc_info=True)

        result = await TaskSerializer.from_orm(task)
        return result.dict()

    @classmethod
    async def assign_task(cls, task_id: str, payload: dict, user_id: str, project_id: Optional[str] = None):
        task_id = Validator.validate_uuid(task_id, "task_id")
        user_id = Validator.validate_uuid(user_id, "user_id")
        if project_id:
            project_id = Validator.validate_uuid(project_id, "project_id")

        validated_data = ASSIGN_TASK_SCHEMA(**payload)

        task = await Task.get_or_none(id=task_id).select_related('project')
        if not task:
            raise NotFoundException(ErrorMessages.TASK_NOT_FOUND)

        if project_id and str(task.project_id) != project_id:
            raise NotFoundException(ErrorMessages.TASK_NOT_IN_PROJECT)

        if task.project.is_archieved:
            raise NotFoundException(ErrorMessages.PROJECT_ARCHIVED)

        if task.version != validated_data.version:
            raise ConflictException(ErrorMessages.TASK_VERSION_MISMATCH)

        # Remove existing assignees
        await TaskAssignee.filter(task_id=task_id).delete()
        
        # Add new assignees
        if validated_data.assignee_ids:
            for assignee_id_str in validated_data.assignee_ids:
                assignee_id = Validator.validate_uuid(assignee_id_str, "assignee_id")
                assignee = await User.get_or_none(id=assignee_id)
                if not assignee:
                    raise NotFoundException(ErrorMessages.ASSIGNEE_NOT_FOUND)
                await TaskAssignee.create(task=task, user=assignee)
                # Log activity for each assignment (non-blocking)
                org_id = str(task.project.org_id)
                try:
                    from app.models.activity import ActionType, EntityType
                    await ActivityManager.create_activity(
                        org_id=org_id,
                        user_id=user_id,
                        entity_type=EntityType.TASK.value,
                        entity_id=task_id,
                        action=ActionType.TASK_ASSIGNED.value,
                        metadata={
                            'assignee_id': str(assignee_id)
                        }
                    )
                except Exception as e:
                    # Log the error but don't fail the request - assignment was already made
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to log task assignment activity: {e}", exc_info=True)

        task.version = task.version + 1
        await task.save()

        result = await TaskSerializer.from_orm(task)
        return result.dict()

    @classmethod
    async def change_task_status(cls, task_id: str, payload: dict, user_id: str, project_id: Optional[str] = None):
        task_id = Validator.validate_uuid(task_id, "task_id")
        user_id = Validator.validate_uuid(user_id, "user_id")
        if project_id:
            project_id = Validator.validate_uuid(project_id, "project_id")

        validated_data = CHANGE_STATUS_SCHEMA(**payload)

        if validated_data.status not in GeneralConstants.TASK_STATUSES:
            raise BadRequestException(ErrorMessages.INVALID_STATUS)

        task = await Task.get_or_none(id=task_id).select_related('project')
        if not task:
            raise NotFoundException(ErrorMessages.TASK_NOT_FOUND)

        if project_id and str(task.project_id) != project_id:
            raise NotFoundException(ErrorMessages.TASK_NOT_IN_PROJECT)

        if task.project.is_archieved:
            raise NotFoundException(ErrorMessages.PROJECT_ARCHIVED)

        if task.version != validated_data.version:
            raise ConflictException(ErrorMessages.TASK_VERSION_MISMATCH)

        old_status = task.status

        task.status = validated_data.status
        task.version = task.version + 1
        await task.save()

        # Log activity (non-blocking - don't fail the request if logging fails)
        org_id = str(task.project.org_id)
        if old_status != validated_data.status:
            try:
                from app.models.activity import ActionType, EntityType
                await ActivityManager.create_activity(
                    org_id=org_id,
                    user_id=user_id,
                    entity_type=EntityType.TASK.value,
                    entity_id=task_id,
                    action=ActionType.TASK_STATUS_CHANGED.value,
                    metadata={
                        "old_status": old_status,
                        "new_status": validated_data.status,
                    }
                )
            except Exception as e:
                # Log the error but don't fail the request - task was already updated
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to log task status change activity: {e}", exc_info=True)

        result = await TaskSerializer.from_orm(task)
        return result.dict()

    @classmethod
    async def list_tasks_by_project(
        cls, 
        project_id: str,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        assignee_id: Optional[str] = None,
        sort_by: str = "updatedAt",
        sort_order: str = "desc"
    ):
        project_id = Validator.validate_uuid(project_id, "project_id")
        
        page = Validator.validate_positive_integer(page, "page", min_value=1)
        page_size = Validator.validate_positive_integer(page_size, "page_size", min_value=1, max_value=100)
        
        if assignee_id:
            assignee_id = Validator.validate_uuid(assignee_id, "assignee_id")

        project = await Project.get_or_none(id=project_id).select_related('org')
        if not project:
            raise NotFoundException(ErrorMessages.PROJECT_NOT_FOUND)
        
        if project.is_archieved:
            raise NotFoundException(ErrorMessages.PROJECT_ARCHIVED)

        if page < 1:
            page = 1
        if page_size < 1:
            page_size = 20
        if page_size > 100:
            page_size = 100

        # Validate status filter
        if status and status not in GeneralConstants.TASK_STATUSES:
            raise BadRequestException(ErrorMessages.INVALID_STATUS)

        # Validate sort_by field
        valid_sort_fields = ["updatedAt", "createdAt", "title", "status"]
        if sort_by not in valid_sort_fields:
            sort_by = "updatedAt"

        # Validate sort_order
        if sort_order not in ["asc", "desc"]:
            sort_order = "desc"

        # Build query
        query = Task.filter(project_id=project_id)

        # Apply filters
        if status:
            query = query.filter(status=status)
        
        if assignee_id:
            # Filter by assignee using TaskAssignee join
            query = query.filter(assignees__user_id=assignee_id)

        # Get total count for pagination
        total = await query.count()

        # Apply sorting
        sort_field = f"-{sort_by}" if sort_order == "desc" else sort_by
        query = query.order_by(sort_field)

        # Apply pagination
        skip = (page - 1) * page_size
        tasks = await query.offset(skip).limit(page_size).all()

        # Convert to list serializers (lighter payload)
        items = []
        for task in tasks:
            serializer = await TaskListSerializer.from_orm(task)
            items.append(serializer.dict())

        # Calculate total pages
        total_pages = ceil(total / page_size) if total > 0 else 0

        # Return paginated response
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }

    @classmethod
    async def validate_project_access(cls, project_id: str, user_id: str, require_write: bool = False):
        project_id = Validator.validate_uuid(project_id, "project_id")
        user_id = Validator.validate_uuid(user_id, "user_id")

        project = await Project.get_or_none(id=project_id).select_related('org')
        if not project:
            raise NotFoundException(ErrorMessages.PROJECT_NOT_FOUND)
        
        if project.is_archieved:
            raise NotFoundException(ErrorMessages.PROJECT_ARCHIVED)

        membership = await Membership.get_or_none(
            userId=user_id,
            organizationId=project.org.id,
            status="active"
        )
        if not membership:
            raise ForbiddenException(ErrorMessages.NO_PROJECT_ACCESS)


        if require_write and membership.role not in ["member", "admin", "owner"]:
            raise ForbiddenException(ErrorMessages.INSUFFICIENT_PERMISSIONS)

        return project, membership
    
    
    @classmethod
    async def delete_task(cls, task_id: str, project_id: Optional[str] = None):
        task_id = Validator.validate_uuid(task_id, "task_id")
        if project_id:
            project_id = Validator.validate_uuid(project_id, "project_id")

        task = await Task.get_or_none(id=task_id).select_related('project')
        if not task:
            raise NotFoundException(ErrorMessages.TASK_NOT_FOUND)

        if project_id and str(task.project_id) != project_id:
            raise NotFoundException(ErrorMessages.TASK_NOT_IN_PROJECT)

        if task.project.is_archieved:
            raise NotFoundException(ErrorMessages.PROJECT_ARCHIVED)

        await task.delete()

    @classmethod
    async def list_my_tasks(
        cls,
        user_id: str,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        sort_by: str = "updatedAt",
        sort_order: str = "desc"
    ):
        user_id = Validator.validate_uuid(user_id, "user_id")
        page = Validator.validate_positive_integer(page, "page", min_value=1)
        page_size = Validator.validate_positive_integer(page_size, "page_size", min_value=1, max_value=100)

        # Validate status filter
        if status and status not in GeneralConstants.TASK_STATUSES:
            raise BadRequestException(ErrorMessages.INVALID_STATUS)

        # Validate sort_by field
        valid_sort_fields = ["updatedAt", "createdAt", "title", "status"]
        if sort_by not in valid_sort_fields:
            sort_by = "updatedAt"

        # Validate sort_order
        if sort_order not in ["asc", "desc"]:
            sort_order = "desc"

        # Build query - get all tasks where user is assigned, and project is not archived
        query = Task.filter(
            assignees__user_id=user_id,
            project__is_archieved=False
        ).select_related('project', 'project__org')

        # Apply status filter
        if status:
            query = query.filter(status=status)

        # Get total count for pagination
        total = await query.count()

        # Apply sorting
        sort_field = f"-{sort_by}" if sort_order == "desc" else sort_by
        query = query.order_by(sort_field)

        # Apply pagination
        skip = (page - 1) * page_size
        tasks = await query.offset(skip).limit(page_size).all()

        # Convert to list serializers
        items = []
        for task in tasks:
            serializer = await TaskListSerializer.from_orm(task)
            items.append(serializer.dict())

        # Calculate total pages
        total_pages = ceil(total / page_size) if total > 0 else 0

        # Return paginated response
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }