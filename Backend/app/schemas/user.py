from pydantic import BaseModel
from app.models import User
from datetime import datetime

class CREATE_USER_SCHEMA(BaseModel):
    firstName: str
    lastName: str
    email: str
    password: str

class UPDATE_USER_SCHEMA(BaseModel):
    firstName: str | None = None
    lastName: str | None = None
    email: str | None = None
    password: str | None = None

# Custom serializer for User model to handle UUID and datetime serialization
class UserSerializer(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: str
    isVerified: bool
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, user: User):
        return cls(
            id=str(user.id),
            firstName=user.firstName,
            lastName=user.lastName,
            email=user.email,
            isVerified=user.isVerified,
            createdAt=user.createdAt.isoformat(),
            updatedAt=user.updatedAt.isoformat(),
        )