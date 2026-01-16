from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from app.routes import api_router
from app.core.lifespan import lifespan
from app.exceptions.exception_handler import (
    collab_task_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    pydantic_validation_exception_handler,
    general_exception_handler,
)
from app.exceptions.exception import CollabTaskException
from app.middlewares.authentication import AuthMiddleware

app = FastAPI(lifespan=lifespan)

app.add_middleware(AuthMiddleware)

app.include_router(api_router)


app.add_exception_handler(CollabTaskException, collab_task_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(ValidationError, pydantic_validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)
