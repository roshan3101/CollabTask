from fastapi import HTTPException
from typing import Optional, Dict, Any


class CollabTaskException(HTTPException):
    def __init__(
        self,
        status_code: int,
        detail: str = None,
        headers: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.status_code = status_code
        self.detail = detail
        self.headers = headers


# 4xx Client Errors


class BadRequestException(CollabTaskException):
    def __init__(self, detail: str = "Bad Request"):
        super().__init__(status_code=400, detail=detail)


class UnauthorizedException(CollabTaskException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(status_code=401, detail=detail)


class ForbiddenException(CollabTaskException):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(status_code=403, detail=detail)


class NotFoundException(CollabTaskException):
    def __init__(self, detail: str = "Not Found"):
        super().__init__(status_code=404, detail=detail)


class MethodNotAllowedException(CollabTaskException):
    def __init__(self, detail: str = "Method Not Allowed"):
        super().__init__(status_code=405, detail=detail)


class ConflictException(CollabTaskException):
    def __init__(self, detail: str = "Conflict"):
        super().__init__(status_code=409, detail=detail)


class GoneException(CollabTaskException):
    def __init__(self, detail: str = "Gone"):
        super().__init__(status_code=410, detail=detail)


class UnprocessableEntityException(CollabTaskException):
    def __init__(self, detail: str = "Unprocessable Entity"):
        super().__init__(status_code=422, detail=detail)


class TooManyRequestsException(CollabTaskException):
    def __init__(self, detail: str = "Too Many Requests"):
        super().__init__(status_code=429, detail=detail)


# 5xx Server Errors


class InternalServerException(CollabTaskException):
    def __init__(self, detail: str = "Internal Server Error"):
        super().__init__(status_code=500, detail=detail)


class NotImplementedException(CollabTaskException):
    def __init__(self, detail: str = "Not Implemented"):
        super().__init__(status_code=501, detail=detail)


class BadGatewayException(CollabTaskException):
    def __init__(self, detail: str = "Bad Gateway"):
        super().__init__(status_code=502, detail=detail)


class ServiceUnavailableException(CollabTaskException):
    def __init__(self, detail: str = "Service Unavailable"):
        super().__init__(status_code=503, detail=detail)


class GatewayTimeoutException(CollabTaskException):
    def __init__(self, detail: str = "Gateway Timeout"):
        super().__init__(status_code=504, detail=detail)
