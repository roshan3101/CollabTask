from app.dependencies import require_user
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

@router.post('/otp/verify')
async def verify_login(request: Request):
    payload = await request.json()
    tokens = await AuthManager.verify_login(payload)
    content = ApiResponse(success=True, message="OTP verification successful.", data=tokens)
    return JSONResponse(content=content, status_code=200)

@router.post('/refresh')
async def refresh_token(request: Request):
    """
    Refresh access token using a valid refresh token.

    This endpoint intentionally does NOT require the Authorization header,
    because the access token may already be expired when the client calls it.
    """
    payload = await request.json()
    tokens = await AuthManager.refresh_tokens(payload)
    content = ApiResponse(success=True, message="Token refresh successful.", data=tokens)
    return JSONResponse(content=content, status_code=200)

@router.post('/logout')
async def logout(request: Request, user_context=Depends(require_user)):
    await AuthManager.logout(user_context)
    content = ApiResponse(success=True, message="Logout successful.")
    return JSONResponse(content=content, status_code=200)

@router.post('/forgot-password/initiate')
async def forget_password_initiate(request: Request):
    payload = await request.json()
    result = await AuthManager.forget_password_initiate(payload)
    content = ApiResponse(success=True, message="Password reset OTP sent to email.", data=result)
    return JSONResponse(content=content, status_code=200)

@router.post('/forgot-password/verify')
async def forget_password_verify(request: Request):
    payload = await request.json()
    await AuthManager.forget_password_verify(payload)
    content = ApiResponse(success=True, message="Password reset verification successful.")
    return JSONResponse(content=content, status_code=200)