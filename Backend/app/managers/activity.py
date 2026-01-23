from app.models import Activity, Organization, Membership
from app.models.membership import MembershipRole, MembershipStatus
from app.exceptions import BadRequestException
from app.utils.validator import Validator
from typing import Dict, List, Optional
from tortoise import connections

class ActivityManager:
    
    @classmethod
    async def get_organization_activities(
        cls,
        org_id: str,
        user_id: str,
        page: int = 1,
        page_size: int = 50,
        entity_type: Optional[str] = None,
        action_type: Optional[str] = None
    ) -> Dict:
        org_id = Validator.validate_uuid(org_id, "org_id")
        user_id = Validator.validate_uuid(user_id, "user_id")
        
        # Check if user is admin or owner
        membership = await Membership.get_or_none(
            userId=user_id,
            organizationId=org_id,
            status=MembershipStatus.ACTIVE
        )
        
        if not membership:
            raise BadRequestException("You are not a member of this organization.")
        
        if membership.role not in [MembershipRole.ADMIN, MembershipRole.OWNER]:
            raise BadRequestException("Only admins and owners can view activities.")
        
        query = Activity.filter(org_id=org_id)
        
        if entity_type:
            query = query.filter(entity_type=entity_type)
        
        if action_type:
            query = query.filter(action=action_type)
        
        # Get total count
        total = await query.count()
        
        # Get paginated results
        activities = await query.order_by("-created_at").offset(
            (page - 1) * page_size
        ).limit(page_size)
        
        # Serialize activities
        activities_list = []
        for activity in activities:
            activities_list.append({
                "id": str(activity.id),
                "entity_type": activity.entity_type,
                "entity_id": str(activity.entity_id),
                "action": activity.action,
                "metadata": activity.metadata or {},
                "user_id": str(activity.user_id),
                "created_at": activity.created_at.isoformat() if activity.created_at else None,
            })
        
        return {
            "activities": activities_list,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size,
            }
        }
    
    @classmethod
    async def create_activity(
        cls,
        org_id: str,
        user_id: str,
        entity_type: str,
        entity_id: str,
        action: str,
        metadata: Optional[Dict] = None
    ) -> Activity:
        activity = await Activity.create(
            org_id=org_id,
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            metadata=metadata
        )
        return activity
