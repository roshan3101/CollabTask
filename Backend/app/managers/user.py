from app.models import User
from app.utils.validator import Validator
from app.exceptions import BadRequestException
from app.schemas.user import CREATE_USER_SCHEMA, UPDATE_USER_SCHEMA, UserSerializer
from app.utils import PasswordUtils

class UserManager:

    @classmethod
    async def createUser(cls, payload: dict):
        payload = Validator.validate_schema(CREATE_USER_SCHEMA, payload)

        existingUser = await User.get_or_none(email=payload.get("email"))
        if existingUser:
            raise BadRequestException("User with this email already exists.")
        
        if 'password' in payload:
            hashed_password = PasswordUtils.hash_password(payload.get("password"))
            payload['password'] = hashed_password
        
        user = await User.create(**payload)
        return UserSerializer.from_orm(user).dict()
    
    @classmethod
    async def updateUser(cls, user_id: str, payload: dict):
        payload = Validator.validate_schema(UPDATE_USER_SCHEMA, payload)

        user = await cls._getUserById(user_id)
        if not user:
            raise BadRequestException("User not found.")
        
        if 'password' in payload:
            hashed_password = PasswordUtils.hash_password(payload.get("password"))
            payload['password'] = hashed_password
        
        await user.update(**payload).apply()
        return user
    
    @classmethod
    async def deleteUser(cls, user_id: str):

        if not user_id:
            raise BadRequestException("User ID is required.")
        
        user = await cls.getUserById(user_id)
        if not user:
            raise BadRequestException("User not found.")
        
        await user.delete()
        return True
    
    @classmethod
    async def getUserList(cls, page_number: int = 1, page_size: int = 10):
        skip = (page_number - 1) * page_size
        users = await User.all().skip(skip).limit(page_size).to_list()
        return users
    
    @classmethod
    async def getUserById(cls, user_id: str):
        user = await User.get(user_id)
        return user
    
    @classmethod
    async def getUserByEmail(cls, email: str):
        user = await User.get_or_none(email=email)
        if not user:
            raise BadRequestException("User not found.")
        return user