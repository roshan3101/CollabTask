from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from app.exceptions.exception import CollabTaskException
from app.utils.apiResponse import ErrorResponse
import logging
import traceback

logger = logging.getLogger(__name__)


def collab_task_exception_handler(request: Request, exc: CollabTaskException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            success=False,
            message=exc.detail or "An error occurred",
            error_code=exc.__class__.__name__
        ).dict()
    )


def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            success=False,
            message=exc.detail or "An error occurred",
            error_code="HTTPException"
        ).dict()
    )


def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_messages = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error.get("loc", []))
        message = error.get("msg", "Validation error")
        error_messages.append(f"{field}: {message}")
    
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            success=False,
            message="Validation failed",
            error_code="ValidationError",
            errors=error_messages
        ).dict()
    )


def pydantic_validation_exception_handler(request: Request, exc: ValidationError):
    error_messages = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error.get("loc", []))
        message = error.get("msg", "Validation error")
        error_messages.append(f"{field}: {message}")
    
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            success=False,
            message="Validation failed",
            error_code="ValidationError",
            errors=error_messages
        ).dict()
    )


def general_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled exception: {type(exc).__name__}",
        exc_info=True,
        extra={
            "path": request.url.path,
            "method": request.method,
            "traceback": traceback.format_exc()
        }
    )
    
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            success=False,
            message="Internal server error. Please try again later.",
            error_code="InternalServerError"
        ).dict()
    )