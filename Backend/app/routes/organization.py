from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.responses import JSONResponse
from app.dependencies import require_user, require_org_membership, require_role
from app.utils import ApiResponse
from app.managers.organization import OrganizationManager
from app.managers.notification import NotificationManager
from app.models import Organization, User
from app.core.websocket_manager import websocket_manager

router = APIRouter(
    prefix="/organizations",
    tags=['Organizations']
)


@router.post('')
@router.post('/')
async def create_organization(request: Request, user=Depends(require_user)):
    payload = await request.json()
    result = await OrganizationManager.create_organization(payload, str(user.get('user_id')))
    content = ApiResponse(
        success=True,
        message="Organization created successfully",
        data=result
    )
    return JSONResponse(content=content, status_code=201)

@router.get('')
@router.get('/')
async def get_user_organizations(request: Request, user=Depends(require_user)):

    organizations = await OrganizationManager.get_user_organizations(str(user.get('user_id')))
    content = ApiResponse(
        success=True,
        message="Organizations retrieved successfully",
        data=organizations
    )
    return JSONResponse(content=content, status_code=200)


@router.get('/{org_id}')
async def get_organization(
    org_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["member", "admin", "owner"]))
):

    org = request.state.org
    content = ApiResponse(
        success=True,
        message="Organization retrieved successfully",
        data={
            "id": str(org.id),
            "name": org.name,
            "address": org.address,
            "website": org.website,
            "description": org.description,
            "role": request.state.role,
            "createdAt": org.createdAt.isoformat(),
            "updatedAt": org.updatedAt.isoformat()
        }
    )
    return JSONResponse(content=content, status_code=200)


@router.get('/{org_id}/members')
async def get_organization_members(
    org_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["member", "admin", "owner"])),
    include_pending: bool = Query(True, description="Include pending invitations")
):

    members = await OrganizationManager.get_organization_members(org_id, include_pending=include_pending)
    content = ApiResponse(
        success=True,
        message="Organization members retrieved successfully",
        data=members
    )
    return JSONResponse(content=content, status_code=200)


@router.put('/{org_id}')
async def update_organization(
    org_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["admin", "owner"]))
):
    
    payload = await request.json()
    result = await OrganizationManager.update_organization(org_id, payload)
    content = ApiResponse(
        success=True,
        message="Organization updated successfully",
        data=result
    )
    return JSONResponse(content=content, status_code=200)

@router.delete('/{org_id}')
async def delete_organization(
    org_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["owner"]))
):

    await OrganizationManager.delete_organization(org_id)
    content = ApiResponse(
        success=True,
        message="Organization deleted successfully"
    )
    return JSONResponse(content=content, status_code=200)

# MEMBERSHIP MANAGEMENT ROUTES

@router.post('/{org_id}/members')
async def add_organization_member(
    org_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["admin", "owner"]))
):
    payload = await request.json()
    user_email = payload.get("email")
    member_role = payload.get("role", "member")

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User email is required"
        )

    result = await OrganizationManager.add_member(org_id, user_email, member_role)
    membership_id = result.get("membership_id")

    org = await Organization.get_or_none(id=org_id)
    invited_user = await User.get_or_none(email=user_email)
    if org and invited_user:
        inviter = request.state.user or {}
        inviter_name = (
            f"{inviter.get('firstName', '')} {inviter.get('lastName', '')}".strip()
            or inviter.get("email", "Someone")
        )
        
        notification = await NotificationManager.create(
            user_id=str(invited_user.id),
            type_val="org_invite",
            title="Organization invite",
            message=f"{inviter_name} invited you to {org.name}.",
            metadata={
                "org_id": str(org.id),
                "org_name": org.name,
                "inviter_name": inviter_name,
                "membership_id": membership_id,
            },
        )
        
        notification_data = {
            "id": str(notification.id),
            "type": "org_invite",
            "title": notification.title,
            "message": notification.message,
            "metadata": notification.metadata or {},
            "read": notification.read,
            "created_at": notification.created_at.isoformat() if notification.created_at else None,
        }
        await websocket_manager.send_notification(str(invited_user.id), notification_data)

    content = ApiResponse(
        success=True,
        message=result["message"]
    )
    return JSONResponse(content=content, status_code=201)

@router.delete('/{org_id}/members/{user_id}')
async def remove_organization_member(
    org_id: str,
    user_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["admin", "owner"]))
):
    result = await OrganizationManager.remove_member(org_id, user_id)
    content = ApiResponse(
        success=True,
        message=result["message"]
    )
    return JSONResponse(content=content, status_code=200)

@router.put('/{org_id}/members/{user_id}/role')
async def change_member_role(
    org_id: str,
    user_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["owner"]))
):
    payload = await request.json()
    new_role = payload.get("role")

    if not new_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New role is required"
        )

    result = await OrganizationManager.change_member_role(org_id, user_id, new_role)
    content = ApiResponse(
        success=True,
        message=result["message"]
    )
    return JSONResponse(content=content, status_code=200)

@router.delete('/{org_id}/leave')
async def leave_organization(
    org_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["member", "admin", "owner"]))
):

    user_id = str(request.state.user.get('user_id'))
    result = await OrganizationManager.remove_member(org_id, user_id)
    content = ApiResponse(
        success=True,
        message="Successfully left the organization"
    )
    return JSONResponse(content=content, status_code=200)

@router.post('/{org_id}/invitations/accept')
async def accept_invitation(
    org_id: str,
    request: Request
):
    user = require_user(request)
    user_id = str(user.get('user_id'))
    result = await OrganizationManager.accept_invite(org_id, user_id)
    content = ApiResponse(
        success=True,
        message=result["message"]
    )
    return JSONResponse(content=content, status_code=200)

@router.post('/{org_id}/invitations/reject')
async def reject_invitation(
    org_id: str,
    request: Request
):
    user = require_user(request)
    user_id = str(user.get('user_id'))
    result = await OrganizationManager.reject_invite(org_id, user_id)
    content = ApiResponse(
        success=True,
        message=result["message"]
    )
    return JSONResponse(content=content, status_code=200)

@router.get('/{org_id}/analytics')
async def get_organization_analytics(
    org_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["member", "admin", "owner"]))
):
    result = await OrganizationManager.get_organization_analytics(org_id)
    content = ApiResponse(success=True, message="Organization analytics retrieved successfully", data=result)
    return JSONResponse(content=content, status_code=200)