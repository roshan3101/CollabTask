from app.models import Project, Organization, Membership
from app.models.membership import MembershipRole
from app.exceptions import BadRequestException
from app.schemas.project import CREATE_PROJECT_SCHEMA, UPDATE_PROJECT_SCHEMA, ProjectSerializer
from tortoise.transactions import in_transaction

class ProjectManager:

    @classmethod
    async def create(cls, payload: dict, user, organization):
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
            created_by_id=user.id
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

            await project.update(**update_data).apply()

        return ProjectSerializer.from_orm(project).dict()

    @classmethod
    async def delete_project(cls, project, role: str):

        if (role not in ["admin", "owner"] and
            str(project.created_by_id) != str(project.org.created_by_id)):
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