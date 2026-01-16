import time
import logging
from typing import Dict, Optional
from collections import defaultdict
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from app.exceptions import TooManyRequestsException

logger = logging.getLogger(__name__)


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


class RateLimiter:
    
    def __init__(self, config: RateLimitConfig):
        self.config = config
        self.requests: Dict[str, list] = defaultdict(list)
        self.window_seconds = 60
    
    def _cleanup_old_requests(self, key: str):
        current_time = time.time()
        cutoff = current_time - self.window_seconds
        
        self.requests[key] = [
            ts for ts in self.requests[key] if ts > cutoff
        ]
    
    def _is_write_request(self, method: str, path: str) -> bool:
        write_methods = {"POST", "PUT", "PATCH", "DELETE"}
        return method in write_methods
    
    def check_rate_limit(
        self,
        identifier: str,
        is_write: bool,
        is_user: bool = False
    ) -> tuple[bool, Optional[str]]:
        self._cleanup_old_requests(identifier)
        
        current_count = len(self.requests[identifier])
        
        if is_user:
            limit = self.config.per_user_write_limit if is_write else self.config.per_user_read_limit
        else:
            limit = self.config.write_requests_per_minute if is_write else self.config.read_requests_per_minute
        
        # Check IP limit for non-user requests
        if not is_user:
            ip_limit = self.config.per_ip_limit
            if current_count >= ip_limit:
                return False, f"IP rate limit exceeded: {ip_limit} requests per minute"
        
        if current_count >= limit:
            return False, f"Rate limit exceeded: {limit} requests per minute"
        
        # Record request
        self.requests[identifier].append(time.time())
        return True, None


class RateLimitingMiddleware(BaseHTTPMiddleware):
    
    def __init__(self, app, config: Optional[RateLimitConfig] = None):
        super().__init__(app)
        self.config = config or RateLimitConfig()
        self.rate_limiter = RateLimiter(self.config)
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for certain paths (health checks, metrics)
        if request.url.path in ["/health", "/metrics", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # Get identifiers
        client_ip = request.client.host if request.client else "unknown"
        user_id = None
        
        # Try to get user ID from request state (set by auth middleware)
        if hasattr(request.state, "user") and request.state.user:
            user_id = str(request.state.user.id)
        
        # Determine if write request
        is_write = self.rate_limiter._is_write_request(request.method, request.url.path)
        
        # Check rate limits
        # First check IP limit
        ip_allowed, ip_error = self.rate_limiter.check_rate_limit(
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
        if user_id:
            user_allowed, user_error = self.rate_limiter.check_rate_limit(
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
        
        # Add rate limit headers to response
        response = await call_next(request)
        
        # Calculate remaining requests
        if user_id:
            remaining = self._calculate_remaining(f"user:{user_id}", is_write, is_user=True)
        else:
            remaining = self._calculate_remaining(f"ip:{client_ip}", is_write, is_user=False)
        
        response.headers["X-RateLimit-Limit"] = str(
            self.config.per_user_write_limit if (is_write and user_id) 
            else self.config.per_user_read_limit if user_id
            else self.config.write_requests_per_minute if is_write
            else self.config.read_requests_per_minute
        )
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
        response.headers["X-RateLimit-Reset"] = str(int(time.time()) + 60)
        
        return response
    
    def _calculate_remaining(self, identifier: str, is_write: bool, is_user: bool) -> int:
        """Calculate remaining requests in current window"""
        self.rate_limiter._cleanup_old_requests(identifier)
        current_count = len(self.rate_limiter.requests[identifier])
        
        if is_user:
            limit = self.config.per_user_write_limit if is_write else self.config.per_user_read_limit
        else:
            limit = self.config.write_requests_per_minute if is_write else self.config.read_requests_per_minute
        
        return max(0, limit - current_count)
