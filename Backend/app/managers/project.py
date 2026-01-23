from app.models import Project, Organization, Membership, Task, TaskAssignee
from app.models.membership import MembershipRole
from app.exceptions import BadRequestException
from app.schemas.project import CREATE_PROJECT_SCHEMA, UPDATE_PROJECT_SCHEMA, ProjectSerializer
from tortoise.transactions import in_transaction
from typing import Dict

class ProjectManager:

    @classmethod
    async def create(cls, payload: dict, user_id: str, organization):
        validated_data = CREATE_PROJECT_SCHEMA(**payload)

        existing_project = await Project.get_or_none(
            name=validated_data.name,
            org_id=organization.organizationId,
            is_archieved=False
        )
        if existing_project:
            raise BadRequestException("Project with this name already exists in the organization.")

        project = await Project.create(
            name=validated_data.name,
            description=validated_data.description,
            org_id=organization.organizationId,
            created_by_id=user_id
        )

        return ProjectSerializer.from_orm(project).dict()

    @classmethod
    async def list_all_projects(cls, payload: dict, membership, role: str):
        org_id = membership.organizationId

        query = Project.filter(org_id=org_id, is_archieved=False)

        if role not in ["admin", "owner"]:
            query = query.filter(created_by_id=membership.userId)

        projects = await query
        return [ProjectSerializer.from_orm(project).dict() for project in projects]

    @classmethod
    async def get_project(cls, project_id: str):
        project = await Project.get_or_none(id=project_id, is_archieved=False)
        if not project:
            raise BadRequestException("Project not found.")

        return ProjectSerializer.from_orm(project).dict()

    @classmethod
    def get_project_from_orm(cls, project):
        return ProjectSerializer.from_orm(project).dict()

    @classmethod
    async def update_project(cls, payload: dict, project):
        validated_data = UPDATE_PROJECT_SCHEMA(**payload)

        update_data = validated_data.dict(exclude_unset=True)

        if update_data:
            if 'name' in update_data:
                existing_project = await Project.get_or_none(
                    name=update_data['name'],
                    org_id=project.org_id,
                    is_archieved=False
                )
                if existing_project and str(existing_project.id) != str(project.id):
                    raise BadRequestException("Project with this name already exists in the organization.")

            for key, value in update_data.items():
                setattr(project, key, value)
            await project.save()

        return ProjectSerializer.from_orm(project).dict()

    @classmethod
    async def delete_project(cls, project, role: str, user_id: str):

        if role not in ["admin", "owner"]:

            if str(project.created_by_id) != str(user_id):
                raise BadRequestException("You don't have permission to delete this project.")

        project.is_archieved = True
        await project.save()

        return {"message": "Project archived successfully."}

    @classmethod
    async def restore_project(cls, project_id: str, membership, role: str):

        if role not in ["admin", "owner"]:
            raise BadRequestException("Only organization admins and owners can restore projects.")

        project = await Project.get_or_none(id=project_id, is_archieved=True)
        if not project:
            raise BadRequestException("Archived project not found.")

        if str(project.org_id) != str(membership.organizationId):
            raise BadRequestException("Project does not belong to this organization.")

        project.is_archieved = False
        await project.save()

        return ProjectSerializer.from_orm(project).dict()

    @classmethod
    async def get_archived_projects(cls, membership, role: str):

        if role not in ["admin", "owner"]:
            raise BadRequestException("Only organization admins and owners can view archived projects.")

        org_id = membership.organizationId
        projects = await Project.filter(org_id=org_id, is_archieved=True)

        return [ProjectSerializer.from_orm(project).dict() for project in projects]

    @classmethod
    async def get_project_analytics(cls, project_id: str) -> Dict:
        """Get analytics for a project"""
        project = await Project.get_or_none(id=project_id, is_archieved=False)
        if not project:
            raise BadRequestException("Project not found.")

        # Total tasks
        total_tasks = await Task.filter(project_id=project_id).count()

        # Active tasks (todo or in_progress)
        active_tasks = await Task.filter(
            project_id=project_id,
            status__in=["todo", "in_progress"]
        ).count()

        # Completed tasks
        completed_tasks = await Task.filter(
            project_id=project_id,
            status="done"
        ).count()

        # Team members (unique users assigned to tasks in this project)
        assignee_ids = await TaskAssignee.filter(
            task__project_id=project_id
        ).distinct().values_list('user_id', flat=True)
        team_members = len(set(assignee_ids)) if assignee_ids else 0

        return {
            "total_tasks": total_tasks,
            "active_tasks": active_tasks,
            "completed_tasks": completed_tasks,
            "team_members": team_members
        }