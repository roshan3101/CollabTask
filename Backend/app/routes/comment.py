from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.dependencies import require_org_membership, require_role
from app.utils import ApiResponse
from app.managers.comment import CommentManager


router = APIRouter(
    prefix="/organizations/{org_id}/projects/{project_id}/comments",
    tags=["Comments"],
)


@router.get("")
@router.get("/")
async def list_comments(
    org_id: str,
    project_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["member", "admin", "owner"])),
):
    comments = await CommentManager.list_comments(org_id, project_id)
    content = ApiResponse(
        success=True,
        message="Comments retrieved successfully",
        data=comments,
    )
    return JSONResponse(content=content, status_code=200)


@router.post("")
@router.post("/")
async def create_comment(
    org_id: str,
    project_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["member", "admin", "owner"])),
):
    payload = await request.json()
    content_text = payload.get("content") or ""

    user = request.state.user or {}
    user_id = str(user.get("user_id"))

    comment = await CommentManager.create_comment(
        org_id=org_id,
        project_id=project_id,
        user_id=user_id,
        content=content_text,
    )

    content = ApiResponse(
        success=True,
        message="Comment added successfully",
        data=comment,
    )
    return JSONResponse(content=content, status_code=201)


@router.put("/{comment_id}")
async def update_comment(
    org_id: str,
    project_id: str,
    comment_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["member", "admin", "owner"])),
):
    payload = await request.json()
    content_text = payload.get("content") or ""

    user = request.state.user or {}
    user_id = str(user.get("user_id"))

    comment = await CommentManager.update_comment(
        org_id=org_id,
        project_id=project_id,
        comment_id=comment_id,
        user_id=user_id,
        content=content_text,
    )

    content = ApiResponse(
        success=True,
        message="Comment updated successfully",
        data=comment,
    )
    return JSONResponse(content=content, status_code=200)


@router.delete("/{comment_id}")
async def delete_comment(
    org_id: str,
    project_id: str,
    comment_id: str,
    request: Request,
    membership=Depends(require_org_membership()),
    role=Depends(require_role(["member", "admin", "owner"])),
):
    user = request.state.user or {}
    user_id = str(user.get("user_id"))

    result = await CommentManager.delete_comment(
        org_id=org_id,
        project_id=project_id,
        comment_id=comment_id,
        user_id=user_id,
        role=role,
    )

    content = ApiResponse(success=True, message=result["message"])
    return JSONResponse(content=content, status_code=200)

