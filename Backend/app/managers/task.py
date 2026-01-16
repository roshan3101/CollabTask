from app.models import Task, Project, User, Membership, MembershipRole
from app.exceptions import BadRequestException
from app.schemas.task import CREATE_TASK_SCHEMA, UPDATE_TASK_SCHEMA, ASSIGN_TASK_SCHEMA, CHANGE_STATUS_SCHEMA, TaskSerializer
from tortoise.transactions import in_transaction
from tortoise.exceptions import IntegrityError

class TaskManager:

    @classmethod
    async def create_task(cls, payload: dict, project_id: str, user_id: str):

        validated_data = CREATE_TASK_SCHEMA(**payload)

        if validated_data.status not in ["todo", "in_progress", "review", "done"]:
            raise BadRequestException("Invalid status. Must be 'todo', 'in_progress', 'review', or 'done'.")

        project = await Project.get_or_none(id=project_id, is_archieved=False)
        if not project:
            raise BadRequestException("Project not found or archived.")

        if validated_data.assignee_id:
            assignee = await User.get_or_none(id=validated_data.assignee_id)
            if not assignee:
                raise BadRequestException("Assignee not found.")
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

        return TaskSerializer.from_orm(task).dict()

    @classmethod
    async def get_task(cls, task_id: str):

        task = await Task.get_or_none(id=task_id).select_related('project', 'assignee', 'created_by')
        if not task:
            raise BadRequestException("Task not found.")

        return TaskSerializer.from_orm(task).dict()

    @classmethod
    async def update_task(cls, task_id: str, payload: dict):
        validated_data = UPDATE_TASK_SCHEMA(**payload)

        if validated_data.status and validated_data.status not in ["todo", "in_progress", "review", "done"]:
            raise BadRequestException("Invalid status. Must be 'todo', 'in_progress', 'review', or 'done'.")

        task = await Task.get_or_none(id=task_id).select_related('project')
        if not task:
            raise BadRequestException("Task not found.")

        if task.version != validated_data.version:
            raise BadRequestException("Task has been modified by another user. Please refresh and try again.")

        if validated_data.assignee_id:
            assignee = await User.get_or_none(id=validated_data.assignee_id)
            if not assignee:
                raise BadRequestException("Assignee not found.")
        else:
            assignee = None

        update_data = validated_data.dict(exclude_unset=True, exclude={'version'})
        if update_data:
            if 'assignee_id' in update_data:
                update_data['assignee'] = assignee

            update_data['version'] = task.version + 1

            await task.update(**update_data).apply()

        return TaskSerializer.from_orm(task).dict()

    @classmethod
    async def assign_task(cls, task_id: str, payload: dict):
        validated_data = ASSIGN_TASK_SCHEMA(**payload)

        task = await Task.get_or_none(id=task_id).select_related('project')
        if not task:
            raise BadRequestException("Task not found.")

        if task.version != validated_data.version:
            raise BadRequestException("Task has been modified by another user. Please refresh and try again.")

        if validated_data.assignee_id:
            assignee = await User.get_or_none(id=validated_data.assignee_id)
            if not assignee:
                raise BadRequestException("Assignee not found.")
        else:
            assignee = None

        task.assignee = assignee
        task.version = task.version + 1
        await task.save()

        return TaskSerializer.from_orm(task).dict()

    @classmethod
    async def change_task_status(cls, task_id: str, payload: dict):
        validated_data = CHANGE_STATUS_SCHEMA(**payload)

        if validated_data.status not in ["todo", "in_progress", "review", "done"]:
            raise BadRequestException("Invalid status. Must be 'todo', 'in_progress', 'review', or 'done'.")

        task = await Task.get_or_none(id=task_id).select_related('project')
        if not task:
            raise BadRequestException("Task not found.")

        if task.version != validated_data.version:
            raise BadRequestException("Task has been modified by another user. Please refresh and try again.")

        task.status = validated_data.status
        task.version = task.version + 1
        await task.save()

        return TaskSerializer.from_orm(task).dict()

    @classmethod
    async def list_tasks_by_project(cls, project_id: str):
        project = await Project.get_or_none(id=project_id, is_archieved=False)
        if not project:
            raise BadRequestException("Project not found or archived.")

        tasks = await Task.filter(project_id=project_id).select_related('assignee', 'created_by').order_by('createdAt')

        return [TaskSerializer.from_orm(task).dict() for task in tasks]

    @classmethod
    async def validate_project_access(cls, project_id: str, user_id: str, require_write: bool = False):

        project = await Project.get_or_none(id=project_id, is_archieved=False).select_related('org')
        if not project:
            raise BadRequestException("Project not found or archived.")

        membership = await Membership.get_or_none(
            userId=user_id,
            organizationId=project.org.id,
            status="active"
        )
        if not membership:
            raise BadRequestException("You do not have access to this project.")

        return project, membership