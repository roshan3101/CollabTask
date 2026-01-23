from app.models import Task, Project, Organization, Membership
from app.models.membership import MembershipStatus
from app.utils.validator import Validator
from typing import Dict, List
from tortoise import connections

class SearchManager:
    
    @classmethod
    async def search(cls, user_id: str, query: str, entity_types: List[str] = None) -> Dict:
        if not query or len(query.strip()) < 2:
            return {
                "tasks": [],
                "projects": [],
                "organizations": []
            }
        
        search_query = query.strip().lower()
        results = {
            "tasks": [],
            "projects": [],
            "organizations": []
        }
        
        user_orgs = await Membership.filter(
            userId=user_id,
            status=MembershipStatus.ACTIVE
        ).values_list('organizationId', flat=True)
        
        if not user_orgs:
            return results
        
        if not entity_types or "task" in entity_types:
            tasks = await Task.filter(
                project__org_id__in=user_orgs,
                project__is_archieved=False
            ).select_related('project', 'project__org').filter(
                title__icontains=search_query
            ).limit(20)
            
            for task in tasks:
                results["tasks"].append({
                    "id": str(task.id),
                    "title": task.title,
                    "status": task.status,
                    "project_id": str(task.project_id),
                    "project_name": task.project.name if task.project else None,
                    "org_id": str(task.project.org_id) if task.project else None,
                    "org_name": task.project.org.name if task.project and task.project.org else None,
                })
        
        if not entity_types or "project" in entity_types:
            projects = await Project.filter(
                org_id__in=user_orgs,
                is_archieved=False
            ).select_related('org').filter(
                name__icontains=search_query
            ).limit(20)
            
            for project in projects:
                results["projects"].append({
                    "id": str(project.id),
                    "name": project.name,
                    "description": project.description,
                    "org_id": str(project.org_id),
                    "org_name": project.org.name if project.org else None,
                })
        
        if not entity_types or "organization" in entity_types:
            orgs = await Organization.filter(
                id__in=user_orgs
            ).filter(
                name__icontains=search_query
            ).limit(20)
            
            for org in orgs:
                results["organizations"].append({
                    "id": str(org.id),
                    "name": org.name,
                    "description": org.description,
                })
        
        return results
