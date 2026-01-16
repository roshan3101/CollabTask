from app.models import Project
from fastapi import Request, HTTPException, status
from app.models import Organization, Membership
from typing import List

def require_user(request: Request):
    if not request.state.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    return request.state.user

def require_org_membership():
    async def org_membership_guard(org_id: str, request: Request):
        user = require_user(request)

        org = await Organization.get_or_none(id=org_id)
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )

        membership = await Membership.get_or_none(
            userId=user.id,
            organizationId=org_id,
            status="active"
        )

        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this organization"
            )

        request.state.org = org
        request.state.role = membership.role

        return membership

    return org_membership_guard

def require_role(allowed_roles: List[str]):
    async def role_guard(request: Request):
        user = require_user(request)

        if not hasattr(request.state, 'role'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Organization membership required"
            )

        if request.state.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {', '.join(allowed_roles)}"
            )

        return request.state.role

    return role_guard

def project_access():
    async def project_access_guard(project_id: str, request: Request):
        user = require_user(request)

        project = await Project.get_or_none(
            id=project_id
        ).select_related('org')

        if not project or project.is_archieved:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        membership = await Membership.get_or_none(
            userId=user.id,
            organizationId=project.org.id,
            status="active"
        )

        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this project"
            )

        request.state.project = project
        request.state.role = membership.role

        return membership
    return project_access_guard
