"""Test health check endpoint."""

from fastapi import status


def test_root_endpoint(client):
    """Test root endpoint returns API information."""
    response = client.get("/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "EmblemHealth Component Tracker"
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "version" in data


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/healthz")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "version" in data
