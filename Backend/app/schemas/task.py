from pydantic import BaseModel
from app.models import Task
from datetime import datetime

class CREATE_TASK_SCHEMA(BaseModel):
    title: str
    description: str | None = None
    status: str = "todo"
    assignee_id: str | None = None

class UPDATE_TASK_SCHEMA(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    assignee_id: str | None = None
    version: int  # Required for optimistic locking

class ASSIGN_TASK_SCHEMA(BaseModel):
    assignee_id: str | None
    version: int

class CHANGE_STATUS_SCHEMA(BaseModel):
    status: str
    version: int

# Custom serializer for Task model to handle UUID and datetime serialization
class TaskSerializer(BaseModel):
    id: str
    title: str
    description: str | None
    status: str
    assignee_id: str | None
    project_id: str
    version: int
    created_by_id: str | None
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, task: Task):
        return cls(
            id=str(task.id),
            title=task.title,
            description=task.description,
            status=task.status,
            assignee_id=str(task.assignee_id) if task.assignee_id else None,
            project_id=str(task.project_id),
            version=task.version,
            created_by_id=str(task.created_by_id) if task.created_by_id else None,
            createdAt=task.createdAt.isoformat(),
            updatedAt=task.updatedAt.isoformat(),
        )