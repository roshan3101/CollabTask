import jwt
from app.core.config import settings
from app.constants import AuthConstants

SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = AuthConstants.JWT_ALGORITHM

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
