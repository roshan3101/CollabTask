from pydantic import BaseModel
from app.models import Organization
from datetime import datetime

class CREATE_ORGANIZATION_SCHEMA(BaseModel):
    name: str
    address: str | None = None
    website: str | None = None
    description: str | None = None

class UPDATE_ORGANIZATION_SCHEMA(BaseModel):
    name: str | None = None
    address: str | None = None
    website: str | None = None
    description: str | None = None

# Custom serializer for Organization model to handle UUID and datetime serialization
class OrganizationSerializer(BaseModel):
    id: str
    name: str
    address: str | None
    website: str | None
    description: str | None
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, org: Organization):
        return cls(
            id=str(org.id),
            name=org.name,
            address=org.address,
            website=org.website,
            description=org.description,
            createdAt=org.createdAt.isoformat(),
            updatedAt=org.updatedAt.isoformat(),
        )