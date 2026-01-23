from fastapi import WebSocket, WebSocketDisconnect, Query
from app.core.websocket_manager import websocket_manager
from app.core.security import decode_access_token
from app.models import User
import logging

logger = logging.getLogger(__name__)


async def get_user_from_token(token: str):
    try:
        payload = decode_access_token(token)
        if not payload:
            return None
        
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        user = await User.get_or_none(id=user_id)
        return user
    except Exception as e:
        logger.error(f"Error decoding WebSocket token: {e}")
        return None


async def websocket_notifications(
    websocket: WebSocket,
    token: str = Query(..., description="JWT access token")
):
    await websocket.accept()
    
    try:
        user = await get_user_from_token(token)
        
        if not user:
            logger.warning("WebSocket connection rejected: Invalid token")
            await websocket.close(code=1008, reason="Unauthorized")
            return
        
        user_id = str(user.id)
        
        await websocket_manager.connect(websocket, user_id)
        
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to notifications"
        })
        
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
            
    except WebSocketDisconnect:
        if 'user_id' in locals():
            websocket_manager.disconnect(websocket, user_id)
            logger.info(f"WebSocket disconnected for user {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if 'user_id' in locals():
            websocket_manager.disconnect(websocket, user_id)
        try:
            await websocket.close()
        except:
            pass
