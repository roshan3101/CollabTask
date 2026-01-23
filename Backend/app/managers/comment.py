from typing import Any, Dict, List

from app.exceptions import BadRequestException, ForbiddenException
from app.models import Comment, Project, Membership
from app.models.membership import MembershipStatus, MembershipRole


class CommentManager:
    @classmethod
    async def create_comment(
        cls,
        org_id: str,
        project_id: str,
        user_id: str,
        content: str,
    ) -> Dict[str, Any]:
        text = (content or "").strip()
        if not text:
            raise BadRequestException("Comment content is required.")

        project = await Project.get_or_none(id=project_id, org_id=org_id)
        if not project:
            raise BadRequestException("Project not found in this organization.")

        membership = await Membership.get_or_none(
            userId=user_id,
            organizationId=org_id,
            status=MembershipStatus.ACTIVE,
        )
        if not membership:
            raise ForbiddenException("You are not an active member of this organization.")

        comment = await Comment.create(
            org_id=org_id,
            project_id=project_id,
            user_id=user_id,
            content=text,
        )
        await comment.fetch_related("user")
        return cls._serialize(comment)

    @classmethod
    async def list_comments(cls, org_id: str, project_id: str) -> List[Dict[str, Any]]:
        project = await Project.get_or_none(id=project_id, org_id=org_id)
        if not project:
            raise BadRequestException("Project not found in this organization.")

        try:
            comments = (
                await Comment.filter(org_id=org_id, project_id=project_id)
                .order_by("createdAt")
                .prefetch_related("user")
            )
        except Exception as e:  # pragma: no cover - defensive for missing table
            if "UndefinedTableError" in type(e).__name__ or 'relation "comments" does not exist' in str(e):
                return []
            raise

        return [cls._serialize(c) for c in comments]

    @classmethod
    async def update_comment(
        cls,
        org_id: str,
        project_id: str,
        comment_id: str,
        user_id: str,
        content: str,
    ) -> Dict[str, Any]:
        text = (content or "").strip()
        if not text:
            raise BadRequestException("Comment content is required.")

        comment = await Comment.get_or_none(
            id=comment_id,
            org_id=org_id,
            project_id=project_id,
        )
        if not comment:
            raise BadRequestException("Comment not found.")

        # Only creator can edit
        if str(comment.user_id) != str(user_id):
            raise ForbiddenException("You do not have permission to edit this comment.")

        comment.content = text
        await comment.save()
        await comment.fetch_related("user")
        return cls._serialize(comment)

    @classmethod
    async def delete_comment(
        cls,
        org_id: str,
        project_id: str,
        comment_id: str,
        user_id: str,
        role: str,
    ) -> Dict[str, Any]:
        comment = await Comment.get_or_none(
            id=comment_id,
            org_id=org_id,
            project_id=project_id,
        )
        if not comment:
            raise BadRequestException("Comment not found.")

        # Only creator, admin, or owner can delete
        if str(comment.user_id) != str(user_id) and role not in [
            MembershipRole.ADMIN,
            MembershipRole.OWNER,
            "admin",
            "owner",
        ]:
            raise ForbiddenException("You do not have permission to delete this comment.")

        await comment.delete()
        return {"message": "Comment deleted successfully."}

    @staticmethod
    def _serialize(comment: Comment) -> Dict[str, Any]:
        user = getattr(comment, "user", None)
        return {
            "id": str(comment.id),
            "content": comment.content,
            "createdAt": comment.createdAt.isoformat() if comment.createdAt else None,
            "user": {
                "id": str(user.id) if user and user.id else None,
                "firstName": getattr(user, "firstName", None) if user else None,
                "lastName": getattr(user, "lastName", None) if user else None,
                "email": getattr(user, "email", None) if user else None,
            },
        }

