from pydantic import BaseModel, Field
from app.models import Task
from datetime import datetime
from typing import Optional, List

class CREATE_TASK_SCHEMA(BaseModel):
    title: str
    description: str | None = None
    status: str = "todo"
    assignee_ids: List[str] = Field(default_factory=list)

class UPDATE_TASK_SCHEMA(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    assignee_ids: List[str] | None = None
    version: int  # Required for optimistic locking

class ASSIGN_TASK_SCHEMA(BaseModel):
    assignee_ids: List[str] = Field(default_factory=list)
    version: int

class CHANGE_STATUS_SCHEMA(BaseModel):
    status: str
    version: int

# Lightweight list response schema (excludes description and other heavy fields)
class TaskListSerializer(BaseModel):
    id: str
    title: str
    status: str
    assignee_ids: List[str] = Field(default_factory=list)
    assignee_names: List[str] = Field(default_factory=list)
    project_id: str
    org_id: str | None = None
    version: int
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True

    @classmethod
    async def from_orm(cls, task: Task):
        from app.models import TaskAssignee
        
        assignees = await TaskAssignee.filter(task_id=task.id).prefetch_related('user')
        assignee_ids = [str(ta.user_id) for ta in assignees]
        assignee_names = [
            f"{ta.user.firstName} {ta.user.lastName}".strip()
            for ta in assignees
            if ta.user
        ]
        
        # Get org_id from project if available
        org_id = None
        if hasattr(task, 'project') and task.project:
            if hasattr(task.project, 'org_id'):
                org_id = str(task.project.org_id)
            elif hasattr(task.project, 'org') and task.project.org:
                org_id = str(task.project.org.id)
        
        return cls(
            id=str(task.id),
            title=task.title,
            status=task.status,
            assignee_ids=assignee_ids,
            assignee_names=assignee_names,
            project_id=str(task.project_id),
            org_id=org_id,
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
    assignee_ids: List[str] = Field(default_factory=list)
    assignee_names: List[str] = Field(default_factory=list)
    project_id: str
    version: int
    created_by_id: str | None
    created_by_name: str | None = None
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True

    @classmethod
    async def from_orm(cls, task: Task):
        from app.models import TaskAssignee
        
        assignees = await TaskAssignee.filter(task_id=task.id).prefetch_related('user')
        assignee_ids = [str(ta.user_id) for ta in assignees]
        assignee_names = [
            f"{ta.user.firstName} {ta.user.lastName}".strip()
            for ta in assignees
            if ta.user
        ]
        
        created_by_name = None
        if task.created_by:
            created_by_name = f"{task.created_by.firstName} {task.created_by.lastName}".strip()
        
        return cls(
            id=str(task.id),
            title=task.title,
            description=task.description,
            status=task.status,
            assignee_ids=assignee_ids,
            assignee_names=assignee_names,
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
    assignee_ids: List[str] = Field(default_factory=list)
    assignee_names: List[str] = Field(default_factory=list)
    project_id: str
    version: int
    created_by_id: str | None
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True

    @classmethod
    async def from_orm(cls, task: Task):
        from app.models import TaskAssignee
        
        assignees = await TaskAssignee.filter(task_id=task.id).prefetch_related('user')
        assignee_ids = [str(ta.user_id) for ta in assignees]
        assignee_names = [
            f"{ta.user.firstName} {ta.user.lastName}".strip()
            for ta in assignees
            if ta.user
        ]
        
        return cls(
            id=str(task.id),
            title=task.title,
            description=task.description,
            status=task.status,
            assignee_ids=assignee_ids,
            assignee_names=assignee_names,
            project_id=str(task.project_id),
            version=task.version,
            created_by_id=str(task.created_by_id) if task.created_by_id else None,
            createdAt=task.createdAt.isoformat(),
            updatedAt=task.updatedAt.isoformat(),
        )