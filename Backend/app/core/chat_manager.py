from typing import Dict, Set
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)


class ChatWebSocketManager:
    def __init__(self) -> None:
        # key: room_id = f"{org_id}:{project_id}"
        self.rooms: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        if room_id not in self.rooms:
            self.rooms[room_id] = set()

        self.rooms[room_id].add(websocket)
        logger.info(
            f"Chat WebSocket connected for room {room_id}. "
            f"Total connections: {len(self.rooms[room_id])}"
        )

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.rooms:
            self.rooms[room_id].discard(websocket)
            if not self.rooms[room_id]:
                del self.rooms[room_id]
            logger.info(f"Chat WebSocket disconnected for room {room_id}")

    async def broadcast_message(self, room_id: str, message: dict):
        if room_id not in self.rooms:
            return

        text = json.dumps(message)
        dead: Set[WebSocket] = set()

        for ws in self.rooms[room_id]:
            try:
                await ws.send_text(text)
            except Exception as e:
                logger.warning(f"Error sending chat message to room {room_id}: {e}")
                dead.add(ws)

        for ws in dead:
            self.disconnect(ws, room_id)


chat_manager = ChatWebSocketManager()

