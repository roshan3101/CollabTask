from app.models import Organization, Membership, Project, Task, TaskAssignee
from app.models.membership import MembershipStatus
from app.exceptions import NotFoundException
from app.utils.validator import Validator
from typing import List, Dict


class DashboardManager:
    
    @classmethod
    async def get_dashboard_analytics(cls, user_id: str) -> Dict:
        user_id = Validator.validate_uuid(user_id, "user_id")
        
        organization_ids = await Membership.filter(
            userId=user_id,
            status=MembershipStatus.ACTIVE
        ).values_list('organizationId', flat=True)
        
        if not organization_ids:
            return {
                "total_projects": 0,
                "active_tasks": 0,
                "complete_tasks": 0,
                "team_members": 0
            }
        
        total_projects = await Project.filter(
            org_id__in=organization_ids,
            is_archieved=False
        ).count()
        
        active_tasks = await Task.filter(
            assignees__user_id=user_id,
            project__is_archieved=False,
            status__in=["todo", "in_progress"]
        ).distinct().count()
        
        complete_tasks = await Task.filter(
            assignees__user_id=user_id,
            project__is_archieved=False,
            status="done"
        ).distinct().count()
        
        team_members = await Membership.filter(
            organizationId__in=organization_ids,
            status=MembershipStatus.ACTIVE
        ).distinct().values_list('userId', flat=True)
        team_members_count = len(set(team_members)) if team_members else 0
        
        return {
            "total_projects": total_projects,
            "active_tasks": active_tasks,
            "complete_tasks": complete_tasks,
            "team_members": team_members_count
        }
    
    @classmethod
    async def get_recent_projects(cls, user_id: str, limit: int = 3) -> List[Dict]:
        user_id = Validator.validate_uuid(user_id, "user_id")
        limit = max(1, min(limit, 10))
        
        organization_ids = await Membership.filter(
            userId=user_id,
            status=MembershipStatus.ACTIVE
        ).values_list('organizationId', flat=True)
        
        if not organization_ids:
            return []
        
        projects = await Project.filter(
            org_id__in=organization_ids,
            is_archieved=False
        ).order_by('-updatedAt').limit(limit).all()
        
        result = []
        for project in projects:
            total_tasks = await Task.filter(project_id=project.id).count()
            
            completed_tasks = await Task.filter(
                project_id=project.id,
                status="done"
            ).count()
            
            result.append({
                "id": str(project.id),
                "name": project.name,
                "description": project.description or "",
                "org_id": str(project.org_id),
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "updatedAt": project.updatedAt.isoformat() if project.updatedAt else None,
                "createdAt": project.createdAt.isoformat() if project.createdAt else None,
            })
        
        return result
