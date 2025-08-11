"""Test WebSocket functionality."""

import pytest
import json
from fastapi.testclient import TestClient


def test_websocket_status_endpoint(client):
    """Test WebSocket status endpoint."""
    response = client.get("/ws/status")
    
    assert response.status_code == 200
    data = response.json()
    assert "active_connections" in data
    assert "connections_info" in data
    assert data["active_connections"] >= 0


def test_websocket_connection_unauthorized(client):
    """Test WebSocket connection without valid token."""
    with client.websocket_connect("/ws/activities?token=invalid") as websocket:
        # Should be closed due to invalid token
        pass  # Connection will be closed by server
