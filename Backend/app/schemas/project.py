from pydantic import BaseModel
from app.models import Project
from datetime import datetime

class CREATE_PROJECT_SCHEMA(BaseModel):
    name: str
    description: str | None = None

class UPDATE_PROJECT_SCHEMA(BaseModel):
    name: str | None = None
    description: str | None = None
    is_archieved: bool | None = None

# Custom serializer for Project model to handle UUID and datetime serialization
class ProjectSerializer(BaseModel):
    id: str
    name: str
    description: str | None
    org_id: str
    created_by_id: str | None
    is_archieved: bool
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, project: Project):
        return cls(
            id=str(project.id),
            name=project.name,
            description=project.description,
            org_id=str(project.org_id),
            created_by_id=str(project.created_by_id) if project.created_by_id else None,
            is_archieved=project.is_archieved,
            createdAt=project.createdAt.isoformat(),
            updatedAt=project.updatedAt.isoformat(),
        )