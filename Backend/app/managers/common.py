from app.models import Organization, Membership
from app.models.membership import MembershipStatus
from app.exceptions import NotFoundException

class CommonManager:
    
    @classmethod
    async def list_projects(cls, user_context: dict):
        user_id = user_context.get("user_id")
        if not user_id: 
            raise NotFoundException("User Id not found")
        
        organizationIds = await Membership.filter(userId = user_id, status = MembershipStatus.ACTIVE).values_list('organizationId', flat=True)
        
        organizations = await Organization.filter(id__in=organizationIds).prefetch_related("projects")
        
        response = []
        for org in organizations:
            response.append({
                "id": str(org.id),
                "name": org.name,
                "projects": [
                    {
                        "id": str(project.id),
                        "name": project.name,
                        "createdAt": project.createdAt,
                    }
                    for project in org.projects
                    if not project.is_archieved
                ]
            })
            
            return response

        
        
        