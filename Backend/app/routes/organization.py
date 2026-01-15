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