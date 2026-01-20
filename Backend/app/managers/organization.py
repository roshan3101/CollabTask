from app.models import Organization, Membership, User
from app.models.membership import MembershipRole, MembershipStatus
from app.exceptions import BadRequestException
from app.schemas.organization import CREATE_ORGANIZATION_SCHEMA, UPDATE_ORGANIZATION_SCHEMA, OrganizationSerializer
from tortoise.transactions import in_transaction
from tortoise import connections

class OrganizationManager:

    @classmethod
    async def create_organization(cls, payload: dict, creator_user_id: str):
        validated_data = CREATE_ORGANIZATION_SCHEMA(**payload)

        existing_org = await Organization.get_or_none(name=validated_data.name)
        if existing_org:
            raise BadRequestException("Organization with this name already exists.")

        async with in_transaction():
            org = await Organization.create(**validated_data.dict())

            await Membership.create(
                userId=creator_user_id,
                organizationId=org.id,
                role=MembershipRole.OWNER,
                status=MembershipStatus.ACTIVE
            )

        return OrganizationSerializer.from_orm(org).dict()

    @classmethod
    async def get_organization_by_id(cls, org_id: str):
        org = await Organization.get_or_none(id=org_id)
        if not org:
            raise BadRequestException("Organization not found.")
        return OrganizationSerializer.from_orm(org).dict()

    @classmethod
    async def update_organization(cls, org_id: str, payload: dict):
        validated_data = UPDATE_ORGANIZATION_SCHEMA(**payload)

        org = await Organization.get_or_none(id=org_id)
        if not org:
            raise BadRequestException("Organization not found.")

        update_data = validated_data.dict(exclude_unset=True)

        if update_data:
            if 'name' in update_data:
                existing_org = await Organization.get_or_none(name=update_data['name'])
                if existing_org and str(existing_org.id) != org_id:
                    raise BadRequestException("Organization with this name already exists.")

            org.name = update_data['name']
            org.address = update_data['address']
            org.website = update_data['website']
            org.description = update_data['description']
            await org.save()

        return OrganizationSerializer.from_orm(org).dict()

    @classmethod
    async def delete_organization(cls, org_id: str):
        org = await Organization.get_or_none(id=org_id)
        if not org:
            raise BadRequestException("Organization not found.")

        async with in_transaction():
            await Membership.filter(organizationId=org_id).delete()
            await org.delete()

        return True

    @classmethod
    async def get_user_organizations(cls, user_id: str):

        conn = connections.get("default")
        rows = await conn.execute_query_dict(
            """
            SELECT m."organizationId" as id, m.role, o.name, o.address, o.website, o.description, o."createdAt", o."updatedAt"
            FROM memberships m
            JOIN organizations o ON m."organizationId" = o.id
            WHERE m."userId" = $1 AND m.status = $2
            """,
            [user_id, MembershipStatus.ACTIVE]
        )

        organizations = []
        for row in rows:
            org_data = {
                'id': str(row['id']),
                'role': row['role'],
                'name': row['name'],
                'address': row['address'],
                'website': row['website'],
                'description': row['description'],
                'createdAt': row['createdAt'].isoformat() if row['createdAt'] else None,
                'updatedAt': row['updatedAt'].isoformat() if row['updatedAt'] else None,
            }
            organizations.append(org_data)

        return organizations

    @classmethod
    async def get_organization_members(cls, org_id: str):

        conn = connections.get("default")
        rows = await conn.execute_query_dict(
            """
            SELECT m."userId" as id, m.role, u."firstName", u."lastName", u.email, u."isVerified"
            FROM memberships m
            JOIN users u ON m."userId" = u.id
            WHERE m."organizationId" = $1 AND m.status = $2
            """,
            [org_id, MembershipStatus.ACTIVE]
        )

        members = []
        for row in rows:
            member_data = {
                'id': str(row['id']),
                'role': row['role'],
                'firstName': row['firstName'],
                'lastName': row['lastName'],
                'email': row['email'],
            }
            members.append(member_data)

        return members

    @classmethod
    async def add_member(cls, org_id: str, user_email: str, role: str = "member"):

        if role not in [MembershipRole.MEMBER, MembershipRole.ADMIN, MembershipRole.OWNER]:
            raise BadRequestException("Invalid role. Must be 'member', 'admin', or 'owner'.")

        org = await Organization.get_or_none(id=org_id)
        if not org:
            raise BadRequestException("Organization not found.")

        user = await User.get_or_none(email=user_email)
        if not user:
            raise BadRequestException("User not found.")

        existing_membership = await Membership.get_or_none(
            userId=user.id,
            organizationId=org_id
        )
        if existing_membership:
            if existing_membership.status == MembershipStatus.ACTIVE:
                raise BadRequestException("User is already a member of this organization.")
            else:
                # Reactivate membership
                existing_membership.status = MembershipStatus.ACTIVE
                existing_membership.role = role
                await existing_membership.save()
                return {"message": "User membership reactivated successfully."}

        await Membership.create(
            userId=user.id,
            organizationId=org_id,
            role=role,
            status=MembershipStatus.ACTIVE
        )

        return {"message": "User added to organization successfully."}

    @classmethod
    async def remove_member(cls, org_id: str, user_id: str):
        org = await Organization.get_or_none(id=org_id)
        if not org:
            raise BadRequestException("Organization not found.")

        membership = await Membership.get_or_none(
            userId=user_id,
            organizationId=org_id,
            status=MembershipStatus.ACTIVE
        )
        if not membership:
            raise BadRequestException("User is not a member of this organization.")

        if membership.role == MembershipRole.OWNER:
            owner_count = await Membership.filter(
                organizationId=org_id,
                role=MembershipRole.OWNER,
                status=MembershipStatus.ACTIVE
            ).count()
            if owner_count <= 1:
                raise BadRequestException("Cannot remove the last owner of the organization.")

        membership.status = MembershipStatus.SUSPENDED
        await membership.save()

        return {"message": "User removed from organization successfully."}

    @classmethod
    async def change_member_role(cls, org_id: str, user_id: str, new_role: str):
        if new_role not in [MembershipRole.MEMBER, MembershipRole.ADMIN, MembershipRole.OWNER]:
            raise BadRequestException("Invalid role. Must be 'member', 'admin', or 'owner'.")

        org = await Organization.get_or_none(id=org_id)
        if not org:
            raise BadRequestException("Organization not found.")

        membership = await Membership.get_or_none(
            userId=user_id,
            organizationId=org_id,
            status=MembershipStatus.ACTIVE
        )
        if not membership:
            raise BadRequestException("User is not a member of this organization.")

        if membership.role == MembershipRole.OWNER and new_role != MembershipRole.OWNER:
            owner_count = await Membership.filter(
                organizationId=org_id,
                role=MembershipRole.OWNER,
                status=MembershipStatus.ACTIVE
            ).count()
            if owner_count <= 1:
                raise BadRequestException("Cannot change role of the last owner.")

        membership.role = new_role
        await membership.save()

        return {"message": "Member role updated successfully."}