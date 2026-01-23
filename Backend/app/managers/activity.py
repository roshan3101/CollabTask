from app.models import Activity, Organization, Membership, User, Task, Project
from app.models.activity import EntityType, ActionType
from app.models.membership import MembershipRole, MembershipStatus
from app.exceptions import BadRequestException
from app.utils.validator import Validator
from typing import Dict, List, Optional

class ActivityManager:
    
    ENTITY_TYPE_OPTIONS = [{"value": e.value, "label": e.value.replace("_", " ").title()} for e in EntityType]
    ACTION_TYPE_OPTIONS = [{"value": a.value, "label": a.value.replace("_", " ").title()} for a in ActionType]

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
        
        total = await query.count()
        total_pages = (total + page_size - 1) // page_size if total else 0
        
        activities = await query.order_by("-created_at").offset(
            (page - 1) * page_size
        ).limit(page_size)
        
        def _et(act):
            v = getattr(act.entity_type, "value", act.entity_type)
            return str(v) if v is not None else ""

        user_ids = list({str(a.user_id) for a in activities})
        users = await User.filter(id__in=user_ids)
        user_map = {str(u.id): f"{u.firstName or ''} {u.lastName or ''}".strip() or u.email for u in users}
        
        task_ids = [str(a.entity_id) for a in activities if _et(a) == EntityType.TASK.value]
        project_ids = [str(a.entity_id) for a in activities if _et(a) == EntityType.PROJECT.value]
        org_ids = [str(a.entity_id) for a in activities if _et(a) == EntityType.ORGANIZATION.value]
        
        tasks = await Task.filter(id__in=task_ids).select_related("project") if task_ids else []
        task_map = {}
        for t in tasks:
            task_map[str(t.id)] = {
                "name": t.title,
                "project_name": t.project.name if t.project else None,
            }
        
        projects = await Project.filter(id__in=project_ids) if project_ids else []
        project_map = {str(p.id): p.name for p in projects}
        
        orgs = await Organization.filter(id__in=org_ids) if org_ids else []
        org_map = {str(o.id): o.name for o in orgs}
        
        activities_list = []
        for activity in activities:
            et = _et(activity)
            user_name = user_map.get(str(activity.user_id)) or "Unknown user"
            entity_name = None
            project_name = None
            
            if et == EntityType.TASK.value:
                info = task_map.get(str(activity.entity_id))
                if info:
                    entity_name = info["name"]
                    project_name = info["project_name"]
                else:
                    entity_name = "Deleted or unknown task"
            elif et == EntityType.PROJECT.value:
                entity_name = project_map.get(str(activity.entity_id)) or "Deleted or unknown project"
            elif et == EntityType.ORGANIZATION.value:
                entity_name = org_map.get(str(activity.entity_id)) or "Deleted or unknown organization"
            
            meta = activity.metadata or {}
            if not entity_name and meta.get("title"):
                entity_name = meta["title"]
            if not entity_name and meta.get("name"):
                entity_name = meta["name"]
            if not entity_name:
                entity_name = "Unknown"
            
            action_val = getattr(activity.action, "value", activity.action) or ""
            activities_list.append({
                "id": str(activity.id),
                "entity_type": et,
                "entity_id": str(activity.entity_id),
                "action": action_val,
                "metadata": meta,
                "user_id": str(activity.user_id),
                "user_name": user_name,
                "entity_name": entity_name,
                "project_name": project_name,
                "created_at": activity.created_at.isoformat() if activity.created_at else None,
            })
        
        return {
            "activities": activities_list,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": total_pages,
            },
            "filter_options": {
                "entity_types": cls.ENTITY_TYPE_OPTIONS,
                "action_types": cls.ACTION_TYPE_OPTIONS,
            },
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
