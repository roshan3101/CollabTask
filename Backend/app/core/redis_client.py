import redis.asyncio as redis
from app.core import settings
import logging
from typing import Optional, Any
import json

logger = logging.getLogger(__name__)


class RedisClient:
    
    _instance: Optional['RedisClient'] = None
    _client: Optional[redis.Redis] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._connect()
    
    def _connect(self):
        try:
            redis_host = getattr(settings, 'REDIS_HOST', 'localhost')
            redis_port = int(getattr(settings, 'REDIS_PORT', 6379))
            redis_db = int(getattr(settings, 'REDIS_DB', 0))
            
            self._client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=redis_db,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            logger.info(f"Redis client initialized: {redis_host}:{redis_port}/{redis_db}")
        except Exception as e:
            logger.error(f"Failed to initialize Redis client: {e}")
            self._client = None
    
    async def get_client(self) -> Optional[redis.Redis]:
        if self._client is None:
            self._connect()
        return self._client
    
    async def ping(self) -> bool:
        try:
            client = await self.get_client()
            if client is None:
                return False
            await client.ping()
            return True
        except Exception as e:
            logger.error(f"Redis ping failed: {e}")
            return False
    
    async def set(
        self,
        key: str,
        value: Any,
        expire: Optional[int] = None,
        serialize: bool = True
    ) -> bool:
        try:
            client = await self.get_client()
            if client is None:
                return False
            
            if serialize:
                value = json.dumps(value)
            
            if expire:
                await client.setex(key, expire, value)
            else:
                await client.set(key, value)
            
            return True
        except Exception as e:
            logger.error(f"Redis SET failed for key {key}: {e}")
            return False
    
    async def get(
        self,
        key: str,
        deserialize: bool = True
    ) -> Optional[Any]:
        try:
            client = await self.get_client()
            if client is None:
                return None
            
            value = await client.get(key)
            if value is None:
                return None
            
            if deserialize:
                try:
                    return json.loads(value)
                except (json.JSONDecodeError, TypeError):
                    return value
            
            return value
        except Exception as e:
            logger.error(f"Redis GET failed for key {key}: {e}")
            return None
    
    async def delete(self, *keys: str) -> int:
        try:
            client = await self.get_client()
            if client is None:
                return 0
            
            return await client.delete(*keys)
        except Exception as e:
            logger.error(f"Redis DELETE failed for keys {keys}: {e}")
            return 0
    
    async def exists(self, *keys: str) -> int:
        try:
            client = await self.get_client()
            if client is None:
                return 0
            
            return await client.exists(*keys)
        except Exception as e:
            logger.error(f"Redis EXISTS failed for keys {keys}: {e}")
            return 0
    
    async def expire(self, key: str, seconds: int) -> bool:
        try:
            client = await self.get_client()
            if client is None:
                return False
            
            return await client.expire(key, seconds)
        except Exception as e:
            logger.error(f"Redis EXPIRE failed for key {key}: {e}")
            return False
    
    async def incr(self, key: str, amount: int = 1) -> Optional[int]:

        try:
            client = await self.get_client()
            if client is None:
                return None
            
            if amount == 1:
                return await client.incr(key)
            else:
                return await client.incrby(key, amount)
        except Exception as e:
            logger.error(f"Redis INCR failed for key {key}: {e}")
            return None
    
    async def decr(self, key: str, amount: int = 1) -> Optional[int]:

        try:
            client = await self.get_client()
            if client is None:
                return None
            
            if amount == 1:
                return await client.decr(key)
            else:
                return await client.decrby(key, amount)
        except Exception as e:
            logger.error(f"Redis DECR failed for key {key}: {e}")
            return None
    
    async def set_add(self, key: str, *values: str) -> int:
        try:
            client = await self.get_client()
            if client is None:
                return 0
            
            return await client.sadd(key, *values)
        except Exception as e:
            logger.error(f"Redis SADD failed for key {key}: {e}")
            return 0
    
    async def set_members(self, key: str) -> set:
        try:
            client = await self.get_client()
            if client is None:
                return set()
            
            return await client.smembers(key)
        except Exception as e:
            logger.error(f"Redis SMEMBERS failed for key {key}: {e}")
            return set()
    
    async def close(self):
        if self._client:
            await self._client.close()
            self._client = None


redis_client = RedisClient()
