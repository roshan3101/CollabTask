from app.models import Organization, Membership, MembershipRole, MembershipStatus
from app.exceptions import BadRequestException
from app.schemas.organization import CREATE_ORGANIZATION_SCHEMA, UPDATE_ORGANIZATION_SCHEMA, OrganizationSerializer
from tortoise.transactions import in_transaction

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

            await org.update(**update_data).apply()

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

        memberships = await Membership.raw(
            """
            SELECT m.*, o.name, o.address, o.website, o.description, o."createdAt", o."updatedAt"
            FROM memberships m
            JOIN organizations o ON m."organizationId" = o.id
            WHERE m."userId" = $1 AND m.status = $2
            """,
            user_id, MembershipStatus.ACTIVE
        )

        organizations = []
        for membership in memberships:
            org_data = {
                'id': str(membership.organizationId),
                'name': membership.name,
                'address': membership.address,
                'website': membership.website,
                'description': membership.description,
                'createdAt': membership.createdAt.isoformat() if membership.createdAt else None,
                'updatedAt': membership.updatedAt.isoformat() if membership.updatedAt else None,
                'role': membership.role
            }
            organizations.append(org_data)

        return organizations

    @classmethod
    async def get_organization_members(cls, org_id: str):

        memberships = await Membership.raw(
            """
            SELECT m.*, u."firstName", u."lastName", u.email, u."isVerified"
            FROM memberships m
            JOIN users u ON m."userId" = u.id
            WHERE m."organizationId" = $1 AND m.status = $2
            """,
            org_id, MembershipStatus.ACTIVE
        )

        members = []
        for membership in memberships:
            member_data = {
                'id': str(membership.userId),
                'firstName': membership.firstName,
                'lastName': membership.lastName,
                'email': membership.email,
                'role': membership.role
            }
            members.append(member_data)

        return members