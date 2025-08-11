"""WebSocket connection manager for real-time features."""

from typing import List, Dict, Any
from fastapi import WebSocket, WebSocketDisconnect
import json
from datetime import datetime
import asyncio
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time broadcasting."""
    
    def __init__(self):
        # Store active connections
        self.active_connections: List[WebSocket] = []
        # Store connection metadata
        self.connection_info: Dict[WebSocket, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int = None):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # Store connection metadata
        self.connection_info[websocket] = {
            "user_id": user_id,
            "connected_at": datetime.utcnow(),
            "last_activity": datetime.utcnow()
        }
        
        logger.info(f"WebSocket connected. User ID: {user_id}, Total connections: {len(self.active_connections)}")
        
        # Broadcast connection count update
        await self.broadcast_json({
            "type": "connection_count",
            "count": len(self.active_connections),
            "timestamp": datetime.utcnow().isoformat()
        })
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        if websocket in self.active_connections:
            user_id = self.connection_info.get(websocket, {}).get("user_id")
            self.active_connections.remove(websocket)
            
            if websocket in self.connection_info:
                del self.connection_info[websocket]
            
            logger.info(f"WebSocket disconnected. User ID: {user_id}, Total connections: {len(self.active_connections)}")
            
            # Broadcast connection count update (async task)
            asyncio.create_task(self.broadcast_json({
                "type": "connection_count",
                "count": len(self.active_connections),
                "timestamp": datetime.utcnow().isoformat()
            }))
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send a message to a specific WebSocket connection."""
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.disconnect(websocket)
    
    async def send_personal_json(self, data: Dict[str, Any], websocket: WebSocket):
        """Send JSON data to a specific WebSocket connection."""
        try:
            await websocket.send_json(data)
            # Update last activity
            if websocket in self.connection_info:
                self.connection_info[websocket]["last_activity"] = datetime.utcnow()
        except Exception as e:
            logger.error(f"Error sending personal JSON: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: str):
        """Broadcast a message to all connected WebSocket clients."""
        if not self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)
    
    async def broadcast_json(self, data: Dict[str, Any]):
        """Broadcast JSON data to all connected WebSocket clients."""
        if not self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
                # Update last activity
                if connection in self.connection_info:
                    self.connection_info[connection]["last_activity"] = datetime.utcnow()
            except Exception as e:
                logger.error(f"Error broadcasting JSON: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)
    
    def get_connection_count(self) -> int:
        """Get the number of active connections."""
        return len(self.active_connections)
    
    def get_connections_info(self) -> List[Dict[str, Any]]:
        """Get information about all active connections."""
        return [
            {
                "user_id": info.get("user_id"),
                "connected_at": info.get("connected_at").isoformat() if info.get("connected_at") else None,
                "last_activity": info.get("last_activity").isoformat() if info.get("last_activity") else None
            }
            for info in self.connection_info.values()
        ]
    
    async def broadcast_activity(self, activity_data: Dict[str, Any]):
        """Broadcast activity update to all clients."""
        await self.broadcast_json({
            "type": "activity_update",
            "data": activity_data,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    async def broadcast_component_update(self, action: str, component_data: Dict[str, Any]):
        """Broadcast component CRUD operations."""
        await self.broadcast_json({
            "type": "component_update",
            "action": action,  # created, updated, deleted
            "data": component_data,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    async def broadcast_upload_progress(self, filename: str, progress: int, status: str):
        """Broadcast file upload progress."""
        await self.broadcast_json({
            "type": "upload_progress",
            "filename": filename,
            "progress": progress,
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        })


# Global connection manager instance
manager = ConnectionManager()
