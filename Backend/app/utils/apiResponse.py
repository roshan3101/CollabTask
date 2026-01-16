from typing import Optional, List, Any, Dict
from pydantic import BaseModel


class ApiResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None

    def dict(self, **kwargs):
        result = {
            "success": self.success,
            "message": self.message,
        }
        if self.data is not None:
            result["data"] = self.data
        return result


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None
    errors: Optional[List[str]] = None

    def dict(self, **kwargs):
        result = {
            "success": self.success,
            "message": self.message,
        }
        if self.error_code:
            result["error_code"] = self.error_code
        if self.errors:
            result["errors"] = self.errors
        return result


def ApiResponse(success: bool, message: str, data: Any = None) -> Dict:
    response = {
        "success": success,
        "message": message,
    }
    if data is not None:
        response["data"] = data
    return response