from app.models import User
from app.exceptions import BadRequestException
from app.utils.validator import Validator
from app.schemas.user import UserSerializer
from typing import Dict

class UserManager:
    
    @classmethod
    async def get_user_profile(cls, user_id: str) -> Dict:
        user_id = Validator.validate_uuid(user_id, "user_id")
        
        user = await User.get_or_none(id=user_id)
        if not user:
            raise BadRequestException("User not found.")
        
        return UserSerializer.from_orm(user).dict()
    
    @classmethod
    async def update_user_profile(cls, user_id: str, payload: dict) -> Dict:
        user_id = Validator.validate_uuid(user_id, "user_id")
        
        user = await User.get_or_none(id=user_id)
        if not user:
            raise BadRequestException("User not found.")
        
        # Validate and update allowed fields
        allowed_fields = ['firstName', 'lastName']
        update_data = {}
        
        for field in allowed_fields:
            if field in payload:
                value = payload[field]
                if value and isinstance(value, str) and value.strip():
                    update_data[field] = value.strip()
        
        if not update_data:
            raise BadRequestException("No valid fields to update.")
        
        # Update user
        for key, value in update_data.items():
            setattr(user, key, value)
        
        await user.save()
        
        return UserSerializer.from_orm(user).dict()
