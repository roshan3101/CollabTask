from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.security import decode_access_token
from app.models.user import User

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.user = None

        if request.scope.get("type") == "websocket":
            return await call_next(request)

        if request.method == "OPTIONS":
            return await call_next(request)

        auth_header = request.headers.get("Authorization")

        if auth_header:
            try:
                scheme, token = auth_header.split(" ", 1)
                if scheme.lower() != "bearer":
                    raise ValueError("Invalid auth scheme")

                payload = decode_access_token(token)
                if payload:
                    user_id = payload.get("sub")
                    if user_id:
                        user = await User.get_or_none(id=user_id)
                        if user:
                            request.state.user = {
                                "user_id": str(user.id),
                                "firstName": str(user.firstName),
                                "lastName": str(user.lastName),
                                "email": str(user.email)
                            }

            except Exception:
                pass

        return await call_next(request)
