from pydantic import BaseModel, Field
from app.models import Task
from datetime import datetime
from typing import Optional, List

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

# Lightweight list response schema (excludes description and other heavy fields)
class TaskListSerializer(BaseModel):
    id: str
    title: str
    status: str
    assignee_id: str | None
    assignee_name: str | None = None  # For convenience in lists
    project_id: str
    version: int
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, task: Task):
        assignee_name = None
        if task.assignee:
            assignee_name = f"{task.assignee.firstName} {task.assignee.lastName}".strip()
        
        return cls(
            id=str(task.id),
            title=task.title,
            status=task.status,
            assignee_id=str(task.assignee_id) if task.assignee_id else None,
            assignee_name=assignee_name,
            project_id=str(task.project_id),
            version=task.version,
            createdAt=task.createdAt.isoformat(),
            updatedAt=task.updatedAt.isoformat(),
        )

# Full detail response schema (includes all fields)
class TaskDetailSerializer(BaseModel):
    id: str
    title: str
    description: str | None
    status: str
    assignee_id: str | None
    assignee_name: str | None = None
    project_id: str
    version: int
    created_by_id: str | None
    created_by_name: str | None = None
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, task: Task):
        assignee_name = None
        if task.assignee:
            assignee_name = f"{task.assignee.firstName} {task.assignee.lastName}".strip()
        
        created_by_name = None
        if task.created_by:
            created_by_name = f"{task.created_by.firstName} {task.created_by.lastName}".strip()
        
        return cls(
            id=str(task.id),
            title=task.title,
            description=task.description,
            status=task.status,
            assignee_id=str(task.assignee_id) if task.assignee_id else None,
            assignee_name=assignee_name,
            project_id=str(task.project_id),
            version=task.version,
            created_by_id=str(task.created_by_id) if task.created_by_id else None,
            created_by_name=created_by_name,
            createdAt=task.createdAt.isoformat(),
            updatedAt=task.updatedAt.isoformat(),
        )

# Pagination response wrapper
class PaginatedResponse(BaseModel):
    items: List[TaskListSerializer]
    total: int
    page: int
    page_size: int
    total_pages: int

# Legacy serializer for backward compatibility (kept for other methods)
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