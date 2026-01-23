import time
from app.observability.logging import get_logger
from typing import Optional
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from app.exceptions import TooManyRequestsException
from app.core.redis_client import redis_client
from app.utils.redis_cache import CacheKeys

logger = get_logger(__name__)


class RateLimitConfig:
    
    def __init__(
        self,
        read_requests_per_minute: int = 100,
        write_requests_per_minute: int = 20,
        per_user_read_limit: int = 200,
        per_user_write_limit: int = 50,
        per_ip_limit: int = 1000
    ):
        self.read_requests_per_minute = read_requests_per_minute
        self.write_requests_per_minute = write_requests_per_minute
        self.per_user_read_limit = per_user_read_limit
        self.per_user_write_limit = per_user_write_limit
        self.per_ip_limit = per_ip_limit


class RedisRateLimiter:
    
    def __init__(self, config: RateLimitConfig):
        self.config = config
        self.window_seconds = 60
    
    def _is_write_request(self, method: str, path: str) -> bool:
        write_methods = {"POST", "PUT", "PATCH", "DELETE"}
        return method in write_methods
    
    async def check_rate_limit(
        self,
        identifier: str,
        is_write: bool,
        is_user: bool = False
    ) -> tuple[bool, Optional[str], int]:
        try:
            # Determine limit
            if is_user:
                limit = self.config.per_user_write_limit if is_write else self.config.per_user_read_limit
            else:
                limit = self.config.write_requests_per_minute if is_write else self.config.read_requests_per_minute
            
            # Use Redis key for rate limiting
            key = CacheKeys.rate_limit(identifier)
            current_time = int(time.time())
            window_start = current_time - (current_time % self.window_seconds)
            window_key = f"{key}:{window_start}"
            
            # Increment counter for this window
            count = await redis_client.incr(window_key)
            
            # Set expiration if this is the first request in the window
            if count == 1:
                await redis_client.expire(window_key, self.window_seconds)
            
            # Check IP limit for non-user requests
            if not is_user:
                ip_limit = self.config.per_ip_limit
                if count > ip_limit:
                    return False, f"IP rate limit exceeded: {ip_limit} requests per minute", 0
            
            # Check user/IP limit
            if count > limit:
                remaining = 0
                return False, f"Rate limit exceeded: {limit} requests per minute", remaining
            
            remaining = max(0, limit - count)
            return True, None, remaining
            
        except Exception as e:
            logger.error(f"Rate limit check failed for {identifier}: {e}")
            # Fail open - allow request if Redis is unavailable
            return True, None, 999


class RedisRateLimitingMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware using Redis"""
    
    def __init__(self, app, config: Optional[RateLimitConfig] = None):
        super().__init__(app)
        self.config = config or RateLimitConfig()
        self.rate_limiter = RedisRateLimiter(self.config)
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for certain paths
        if request.url.path in ["/health", "/metrics", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # Get identifiers
        client_ip = request.client.host if request.client else "unknown"
        user_id = None
        
        # Try to get user ID from request state
        if hasattr(request.state, "user") and request.state.user:
            user_id = str(request.state.user.id)
        
        # Determine if write request
        is_write = self.rate_limiter._is_write_request(request.method, request.url.path)
        
        # Check rate limits
        # First check IP limit
        ip_allowed, ip_error, ip_remaining = await self.rate_limiter.check_rate_limit(
            f"ip:{client_ip}",
            is_write,
            is_user=False
        )
        
        if not ip_allowed:
            logger.warning(
                f"IP rate limit exceeded: {client_ip}",
                extra={"ip": client_ip, "path": request.url.path, "method": request.method}
            )
            raise TooManyRequestsException(ip_error or "Rate limit exceeded")
        
        # Then check user limit if authenticated
        user_remaining = ip_remaining
        if user_id:
            user_allowed, user_error, user_remaining = await self.rate_limiter.check_rate_limit(
                f"user:{user_id}",
                is_write,
                is_user=True
            )
            
            if not user_allowed:
                logger.warning(
                    f"User rate limit exceeded: {user_id}",
                    extra={"user_id": user_id, "path": request.url.path, "method": request.method}
                )
                raise TooManyRequestsException(user_error or "Rate limit exceeded")
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        limit = (
            self.config.per_user_write_limit if (is_write and user_id)
            else self.config.per_user_read_limit if user_id
            else self.config.write_requests_per_minute if is_write
            else self.config.read_requests_per_minute
        )
        
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(user_remaining)
        response.headers["X-RateLimit-Reset"] = str(int(time.time()) + 60)
        
        return response
