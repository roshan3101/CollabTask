import random
from app.models.user import User
import jwt
from uuid import uuid4
from datetime import datetime, timedelta, timezone
import bcrypt

from app.exceptions.exception import BadRequestException
from app.models.auth import Auth
from app.core import settings
from app.constants import ErrorMessages, GeneralConstants
from app.constants import AuthConstants

class OTPUtils:
    @classmethod
    async def send_otp(cls, user_id: str, email: str) -> str:
        otp = cls._generate_otp()

        await cls.delete_otp(user_id)

        await Auth.create(
            userId=user_id,
            otp=otp
        )

        await cls._send_otp_via_email(email, otp)

        return
    
    @classmethod
    async def verify_otp(cls, user_id: str, otp: str) -> bool:
        auth_record = await Auth.get_or_none(userId=user_id).order_by('-createdAt').first()
        if not auth_record:
            return False
        if auth_record.is_expired():
            return False
        return auth_record.otp == otp
    
    @classmethod
    async def delete_otp(cls, user_id: str):
        await Auth.filter(userId=user_id).delete()
    
    @classmethod
    async def _send_otp_via_email(cls, email: str, otp: str):
        # Placeholder for sending OTP via email
        print(f"Sending OTP {otp} to email {email}")

    @classmethod
    def _generate_otp(cls) -> str:
        return str(random.randint(GeneralConstants.OTP_MIN, GeneralConstants.OTP_MAX))

class JWTUtils:
    @classmethod
    async def create_token_pair(cls, user) -> dict:
        access_token = await cls.create_access_token(user)
        refresh_token = await cls._create_refresh_token(user)
        return {"access_token": access_token, "refresh_token": refresh_token}

    @classmethod
    async def verify_token(cls, token: str, type: str) -> dict:
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[AuthConstants.JWT_ALGORITHM],
            )
            if payload.get("type") != type:
                raise BadRequestException(ErrorMessages.INVALID_TOKEN_TYPE)
            return payload
        except jwt.ExpiredSignatureError:
            raise BadRequestException(ErrorMessages.TOKEN_EXPIRED)
        except jwt.InvalidTokenError:
            raise BadRequestException(ErrorMessages.INVALID_TOKEN)
        except Exception as e:
            raise BadRequestException(str(e))

    @classmethod
    async def create_access_token(cls, user) -> str:
        now = datetime.now(timezone.utc)
        expire = now + timedelta(
            minutes=AuthConstants.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        token_uuid = str(uuid4())
        payload = {
            "sub": str(user.id),
            "iat": int(now.timestamp()),
            "exp": int(expire.timestamp()),
            "jti": token_uuid,
            "type": "access"
        }
        token = jwt.encode(
            payload,
            settings.JWT_SECRET_KEY,
            algorithm=AuthConstants.JWT_ALGORITHM,
        )
        return token

    @classmethod
    async def _create_refresh_token(cls, user) -> str:
        now = datetime.now(timezone.utc)
        expire = now + timedelta(days=AuthConstants.REFRESH_TOKEN_EXPIRE_DAYS)
        token_uuid = str(uuid4())
        payload = {
            "sub": str(user.id),
            "iat": int(now.timestamp()),
            "exp": int(expire.timestamp()),
            "jti": token_uuid,
            "type": "refresh",
        }
        token = jwt.encode(
            payload,
            settings.JWT_SECRET_KEY,
            algorithm=AuthConstants.JWT_ALGORITHM,
        )
        return token


class PasswordUtils:

    @classmethod
    def hash_password(cls, password: str) -> str:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @classmethod
    def verify_password(cls, plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8'),
    )