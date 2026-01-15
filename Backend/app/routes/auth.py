from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse

from app.utils import ApiResponse
from app.managers.auth import AuthManager

router = APIRouter(
    prefix="/auth",
    tags=['Authentication']
)

@router.post('/signup')
async def signup(request: Request):
    payload = await request.json()
    result = await AuthManager.signup(payload)
    content = ApiResponse(success=True, message="Signup successful.", data=result)
    return JSONResponse(content=content, status_code=201)


@router.post('/login/initiate')
async def login(request: Request):
    payload = await request.json()
    result = await AuthManager.login(payload)
    content = ApiResponse(success=True, message="Login successful.", data=result)
    return JSONResponse(content=content, status_code=200)

@router.post('/login/verify')
async def verify_login(request: Request):
    payload = await request.json()
    tokens = await AuthManager.verify_login(payload)
    content = ApiResponse(success=True, message="Login verification successful.", data=tokens)
    return JSONResponse(content=content, status_code=200)