"""WebSocket routes for real-time features."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from websocket_manager import manager
from auth import verify_token
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["websocket"])


@router.websocket("/activities")
async def websocket_activities(
    websocket: WebSocket, 
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time activity feed."""
    # Verify token and get user
    token_data = verify_token(token)
    user_id = None
    
    if token_data and token_data.email:
        from crud import get_user_by_email
        user = get_user_by_email(db, token_data.email)
        if user:
            user_id = user.id
    
    if not user_id:
        await websocket.close(code=1008, reason="Invalid authentication token")
        return
    
    await manager.connect(websocket, user_id)
    
    try:
        # Send welcome message
        await manager.send_personal_json(
            {
                "type": "welcome",
                "message": "Connected to activity feed",
                "user_id": user_id,
                "connection_count": manager.get_connection_count()
            },
            websocket
        )
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Wait for incoming messages (ping/pong, etc.)
                data = await websocket.receive_text()
                
                # Handle ping messages
                if data == "ping":
                    await manager.send_personal_json(
                        {
                            "type": "pong",
                            "timestamp": manager.connection_info[websocket]["last_activity"].isoformat()
                        },
                        websocket
                    )
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                break
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
    finally:
        manager.disconnect(websocket)


@router.get("/status")
async def websocket_status():
    """Get WebSocket connection status."""
    return {
        "active_connections": manager.get_connection_count(),
        "connections_info": manager.get_connections_info()
    }
