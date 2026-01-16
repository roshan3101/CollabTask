from app.models import Task, Project, User, Membership, MembershipRole
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

        if validated_data.assignee_id:
            assignee_id = Validator.validate_uuid(validated_data.assignee_id, "assignee_id")
            assignee = await User.get_or_none(id=assignee_id)
            if not assignee:
                raise NotFoundException(ErrorMessages.ASSIGNEE_NOT_FOUND)
        else:
            assignee = None

        task = await Task.create(
            title=validated_data.title,
            description=validated_data.description,
            status=validated_data.status,
            assignee=assignee,
            project=project,
            created_by_id=user_id
        )

        # Log activity
        task_data = {
            'title': validated_data.title,
            'description': validated_data.description,
            'status': validated_data.status,
            'assignee_id': str(validated_data.assignee_id) if validated_data.assignee_id else None
        }
        await ActivityManager.log_task_created(
            str(task.id),
            project_id,
            str(project.org_id),
            user_id,
            task_data
        )

        return TaskSerializer.from_orm(task).dict()

    @classmethod
    async def get_task(cls, task_id: str, project_id: Optional[str] = None):
        task_id = Validator.validate_uuid(task_id, "task_id")
        
        task = await Task.get_or_none(id=task_id).select_related('project', 'assignee', 'created_by')
        if not task:
            raise NotFoundException(ErrorMessages.TASK_NOT_FOUND)

        if project_id:
            project_id = Validator.validate_uuid(project_id, "project_id")
            if str(task.project_id) != project_id:
                raise NotFoundException(ErrorMessages.TASK_NOT_IN_PROJECT)
            
            # Check if project is archived
            if task.project.is_archieved:
                raise NotFoundException(ErrorMessages.PROJECT_ARCHIVED)

        return TaskDetailSerializer.from_orm(task).dict()

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

        if validated_data.assignee_id:
            assignee_id = Validator.validate_uuid(validated_data.assignee_id, "assignee_id")
            assignee = await User.get_or_none(id=assignee_id)
            if not assignee:
                raise NotFoundException(ErrorMessages.ASSIGNEE_NOT_FOUND)
        else:
            assignee = None

        update_data = validated_data.dict(exclude_unset=True, exclude={'version'})
        if update_data:
            # Store old values for activity logging
            old_title = task.title
            old_description = task.description
            old_assignee_id = str(task.assignee_id) if task.assignee_id else None

            if 'assignee_id' in update_data:
                update_data['assignee'] = assignee

            update_data['version'] = task.version + 1

            await task.update(**update_data).apply()

            # Log activities for changes
            org_id = str(task.project.org_id)

            if 'title' in update_data and update_data['title'] != old_title:
                await ActivityManager.log_task_title_updated(
                    task_id, org_id, user_id, old_title, update_data['title']
                )

            if 'description' in update_data and update_data['description'] != old_description:
                await ActivityManager.log_task_description_updated(
                    task_id, org_id, user_id, old_description or '', update_data['description'] or ''
                )

            if 'assignee' in update_data:
                new_assignee_id = str(update_data['assignee'].id) if update_data['assignee'] else None
                if new_assignee_id != old_assignee_id:
                    if new_assignee_id:
                        await ActivityManager.log_task_assigned(task_id, org_id, user_id, new_assignee_id)
                    elif old_assignee_id:
                        await ActivityManager.log_task_unassigned(task_id, org_id, user_id, old_assignee_id)

        return TaskSerializer.from_orm(task).dict()

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

        old_assignee_id = str(task.assignee_id) if task.assignee_id else None

        if validated_data.assignee_id:
            assignee_id = Validator.validate_uuid(validated_data.assignee_id, "assignee_id")
            assignee = await User.get_or_none(id=assignee_id)
            if not assignee:
                raise NotFoundException(ErrorMessages.ASSIGNEE_NOT_FOUND)
        else:
            assignee = None

        task.assignee = assignee
        task.version = task.version + 1
        await task.save()

        # Log activity
        org_id = str(task.project.org_id)
        new_assignee_id = str(assignee.id) if assignee else None

        if new_assignee_id and new_assignee_id != old_assignee_id:
            await ActivityManager.log_task_assigned(task_id, org_id, user_id, new_assignee_id)
        elif not new_assignee_id and old_assignee_id:
            await ActivityManager.log_task_unassigned(task_id, org_id, user_id, old_assignee_id)

        return TaskSerializer.from_orm(task).dict()

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

        # Log activity
        org_id = str(task.project.org_id)
        if old_status != validated_data.status:
            await ActivityManager.log_task_status_changed(task_id, org_id, user_id, old_status, validated_data.status)

        return TaskSerializer.from_orm(task).dict()

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
            query = query.filter(assignee_id=assignee_id)

        # Get total count for pagination
        total = await query.count()

        # Apply sorting
        sort_field = f"-{sort_by}" if sort_order == "desc" else sort_by
        query = query.order_by(sort_field)

        # Apply pagination
        skip = (page - 1) * page_size
        tasks = await query.select_related('assignee').offset(skip).limit(page_size).all()

        # Convert to list serializers (lighter payload)
        items = [TaskListSerializer.from_orm(task).dict() for task in tasks]

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

        if require_write and membership.role not in ["admin", "owner"]:
            raise ForbiddenException(ErrorMessages.INSUFFICIENT_PERMISSIONS)

        return project, membership