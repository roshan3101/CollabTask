from typing import Dict, Set
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)


class WebSocketManager:
    
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        logger.info(f"WebSocket connected for user {user_id}. Total connections: {len(self.active_connections[user_id])}")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
            
            logger.info(f"WebSocket disconnected for user {user_id}")
    
    async def send_notification(self, user_id: str, notification: dict):
        if user_id not in self.active_connections:
            logger.debug(f"No active connections for user {user_id}")
            return
        
        message = json.dumps({
            "type": "notification",
            "data": notification
        })
        
        disconnected = set()
        for websocket in self.active_connections[user_id]:
            try:
                await websocket.send_text(message)
            except Exception as e:
                logger.warning(f"Error sending notification to user {user_id}: {e}")
                disconnected.add(websocket)
        
        for ws in disconnected:
            self.disconnect(ws, user_id)
    
    async def send_personal_message(self, user_id: str, message: dict):
        await self.send_notification(user_id, message)


websocket_manager = WebSocketManager()
