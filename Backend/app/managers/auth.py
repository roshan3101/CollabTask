from app.exceptions import BadRequestException
from app.models import UserSessions, User
from app.utils.auth import OTPUtils, JWTUtils, PasswordUtils
from app.utils.validator import Validator
from app.schemas.auth import SIGNUP_SCHEMA, LOGIN_SCHEMA, VERIFY_LOGIN_SCHEMA
from app.schemas.user import UserSerializer

class AuthManager:
    @classmethod
    async def signup(cls, payload: dict):

        payload = Validator.validate_schema(SIGNUP_SCHEMA, payload)

        existingUser = await User.get_or_none(email=payload.get("email"))
        if existingUser:
            raise BadRequestException("User with this email already exists.")
        
        if 'password' in payload:
            hashed_password = PasswordUtils.hash_password(payload.get("password"))
            payload['password'] = hashed_password
        
        user = await User.create(**payload)
        return UserSerializer.from_orm(user).dict()
    
    @classmethod
    async def login(cls, payload: dict):
        payload = Validator.validate_schema(LOGIN_SCHEMA, payload)

        email = payload.get("email")
        password = payload.get("password")

        user = await User.get_or_none(email=email)
        if not user:
            raise BadRequestException("Invalid email or password.")
        
        is_password_valid = PasswordUtils.verify_password(password, user.password)
        if not is_password_valid:
            raise BadRequestException("Invalid email or password.")
        
        await OTPUtils.send_otp(user_id=str(user.id), email=user.email)
        
        return UserSerializer.from_orm(user).dict()
    
    @classmethod
    async def verify_login(cls, payload: dict):
        payload = Validator.validate_schema(VERIFY_LOGIN_SCHEMA, payload)

        user_id = payload.get("user_id")
        user = await User.get_or_none(id=user_id)

        if not user:
            raise BadRequestException("User not found.")
        
        otp = payload.get("otp")
        is_otp_valid = await OTPUtils.verify_otp(user_id, otp)
        if not is_otp_valid:
            raise BadRequestException("Invalid OTP.")
        
        tokens = await JWTUtils.create_token_pair(user)
        await OTPUtils.delete_otp(user_id)

        await UserSessions.create(
            userId=user.id,
            refreshToken=tokens['refresh_token']
        )

        return tokens

    @classmethod
    async def logout(cls, user_context: dict):
        user_id = user_context.get("user_id")
        if not user_id:
            raise BadRequestException("User not authenticated.")
        
        user = await User.get_or_none(id=user_id)
        if not user:
            raise BadRequestException("User not found.")
        
        await UserSessions.filter(userId=user_id).delete()
        return True
    
    @classmethod
    async def refresh_tokens(cls, payload: dict, user_context: dict):
        refresh_token = payload.get("refresh_token")
        user_id = user_context.get("user_id")

        if not user_id:
            raise BadRequestException("User not authenticated.")
        
        user = await User.get_or_none(id=user_id)
        if not user:
            raise BadRequestException("User not found.")
        
        session = await UserSessions.get_or_none(userId=user_id, refreshToken=refresh_token)
        if not session:
            raise BadRequestException("Invalid refresh token.")
        
        await JWTUtils.verify_token(refresh_token, type="refresh")
        
        tokens = await JWTUtils.create_token_pair(user)

        session.refreshToken = tokens['refresh_token']
        await session.save()

        return tokens

    @classmethod
    async def forget_password_initiate(cls, payload: dict):
        payload = Validator.validate_schema({"email": str}, payload)

        email = payload.get("email")
        user = await User.get_or_none(email=email)
        if not user:
            raise BadRequestException("User not found.")
        
        await OTPUtils.send_otp(user_id=str(user.id), email=user.email)
        return True
    
    @classmethod
    async def forget_password_verify(cls, payload: dict):
        
        payload = Validator.validate_schema({
            "email": str,
            "otp": str,
            "new_password": str
        }, payload)

        email = payload.get("email")
        otp = payload.get("otp")
        new_password = payload.get("new_password")

        user = await User.get_or_none(email=email)
        if not user:
            raise BadRequestException("User not found.")

        is_otp_valid = await OTPUtils.verify_otp(user_id=str(user.id), otp=otp)
        if not is_otp_valid:
            raise BadRequestException("Invalid OTP.")

        hashed_password = PasswordUtils.hash_password(new_password)
        await User.filter(id=user.id).update(password=hashed_password)

        await OTPUtils.delete_otp(user_id=str(user.id))
        return True