from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from app.dependencies import require_user, require_org_membership, require_role
from app.utils import ApiResponse
from app.managers.organization import OrganizationManager

router = APIRouter(
    prefix="/organizations",
    tags=['Organizations']
)


@router.post('/')
async def create_organization(request: Request, user=Depends(require_user)):
    payload = await request.json()
    result = await OrganizationManager.create_organization(payload, str(user.id))
    content = ApiResponse(
        success=True,
        message="Organization created successfully",
        data=result
    )
    return JSONResponse(content=content, status_code=201)

@router.get('/')
async def get_user_organizations(request: Request, user=Depends(require_user)):

    organizations = await OrganizationManager.get_user_organizations(str(user.id))
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
    role=Depends(require_role(["member", "admin", "owner"]))
):

    members = await OrganizationManager.get_organization_members(org_id)
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

    user_id = str(request.state.user.id)
    result = await OrganizationManager.remove_member(org_id, user_id)
    content = ApiResponse(
        success=True,
        message="Successfully left the organization"
    )
    return JSONResponse(content=content, status_code=200)