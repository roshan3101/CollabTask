from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.security import decode_access_token
from app.models.user import User

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        request.state.user = None

        auth_header = request.headers.get("Authorization")

        if auth_header:
            try:
                scheme, token = auth_header.split(" ")
                if scheme.lower() != "bearer":
                    raise ValueError("Invalid auth scheme")

                payload = decode_access_token(token)
                if payload:
                    user_id = payload.get("sub")
                    if user_id:
                        user = await User.get_or_none(id=user_id)
                        if user:
                            request.state.user = user

            except Exception:
                # Invalid auth header or token
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Invalid authentication credentials"}
                )

        return await call_next(request)
