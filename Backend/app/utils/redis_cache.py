from app.core.redis_client import redis_client
from typing import Optional, Callable, Any
import hashlib
import json
import logging

logger = logging.getLogger(__name__)


def cache_key(prefix: str, *args, **kwargs) -> str:
    key_parts = [prefix]
    
    if args:
        args_str = ":".join(str(arg) for arg in args)
        key_parts.append(args_str)
    
    if kwargs:
        kwargs_str = ":".join(f"{k}:{v}" for k, v in sorted(kwargs.items()))
        key_parts.append(kwargs_str)
    
    key = ":".join(key_parts)
    
    if len(key) > 250:
        key_hash = hashlib.md5(key.encode()).hexdigest()
        return f"{prefix}:hash:{key_hash}"
    
    return key


async def cached_get(
    key: str,
    expire: int = 3600,
    default: Any = None
) -> Optional[Any]:

    value = await redis_client.get(key)
    return value if value is not None else default


async def cached_set(
    key: str,
    value: Any,
    expire: int = 3600
) -> bool:

    return await redis_client.set(key, value, expire=expire)


async def cached_get_or_set(
    key: str,
    fetch_func: Callable,
    expire: int = 3600,
    *args,
    **kwargs
) -> Any:

    # Try to get from cache
    cached_value = await redis_client.get(key)
    if cached_value is not None:
        return cached_value
    
    # Fetch and cache
    try:
        value = await fetch_func(*args, **kwargs)
        await redis_client.set(key, value, expire=expire)
        return value
    except Exception as e:
        logger.error(f"Error in cached_get_or_set for key {key}: {e}")
        raise


async def invalidate_cache(pattern: str = None, *keys: str):
    if keys:
        await redis_client.delete(*keys)
    # TODO: Implement pattern-based invalidation if needed


class CacheKeys:
    
    USER = "user"
    ORGANIZATION = "org"
    PROJECT = "project"
    TASK = "task"
    NOTIFICATION = "notification"
    SESSION = "session"
    RATE_LIMIT = "rate_limit"
    
    @staticmethod
    def user(user_id: str) -> str:
        return f"{CacheKeys.USER}:{user_id}"
    
    @staticmethod
    def organization(org_id: str) -> str:
        return f"{CacheKeys.ORGANIZATION}:{org_id}"
    
    @staticmethod
    def project(project_id: str) -> str:
        return f"{CacheKeys.PROJECT}:{project_id}"
    
    @staticmethod
    def task(task_id: str) -> str:
        return f"{CacheKeys.TASK}:{task_id}"
    
    @staticmethod
    def rate_limit(identifier: str) -> str:
        return f"{CacheKeys.RATE_LIMIT}:{identifier}"
