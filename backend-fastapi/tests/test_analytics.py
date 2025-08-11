"""Test analytics endpoints."""

import pytest
from fastapi import status


def test_analytics_summary(client, authenticated_headers, test_component):
    """Test analytics summary endpoint."""
    response = client.get("/api/analytics/summary", headers=authenticated_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Check required fields
    assert "total_components" in data
    assert "total_towers" in data
    assert "innovation_score" in data
    assert "tech_diversity" in data
    assert "timestamp" in data
    
    # Check data types
    assert isinstance(data["total_components"], int)
    assert isinstance(data["innovation_score"], (int, float))
    assert data["total_components"] >= 1  # At least our test component


def test_trends_analytics(client, authenticated_headers):
    """Test trends analytics endpoint."""
    response = client.get("/api/analytics/trends", headers=authenticated_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Check required fields
    assert "monthly_releases" in data
    assert "monthly_components" in data
    assert "status_distribution" in data
    assert "timestamp" in data
    
    # Check data types
    assert isinstance(data["monthly_releases"], list)
    assert isinstance(data["monthly_components"], list)
    assert isinstance(data["status_distribution"], list)


def test_tower_performance(client, authenticated_headers, test_component):
    """Test tower performance analytics endpoint."""
    response = client.get("/api/analytics/tower-performance", headers=authenticated_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Check required fields
    assert "tower_performance" in data
    assert "complexity_distribution" in data
    assert "timestamp" in data
    
    # Check data types
    assert isinstance(data["tower_performance"], list)
    assert isinstance(data["complexity_distribution"], dict)
    
    # Should have at least one tower (from test component)
    assert len(data["tower_performance"]) >= 1
    
    # Check tower performance structure
    if data["tower_performance"]:
        tower = data["tower_performance"][0]
        assert "tower_name" in tower
        assert "component_count" in tower
        assert "velocity_score" in tower


def test_analytics_unauthorized(client):
    """Test analytics endpoints without authentication."""
    endpoints = [
        "/api/analytics/summary",
        "/api/analytics/trends",
        "/api/analytics/tower-performance"
    ]
    
    for endpoint in endpoints:
        response = client.get(endpoint)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
