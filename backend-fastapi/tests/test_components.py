"""Test component endpoints."""

import pytest
from fastapi import status


def test_create_component(client, authenticated_headers, test_tower):
    """Test creating a new component."""
    response = client.post("/api/components/", 
        headers=authenticated_headers,
        json={
            "name": "New Component",
            "slug": "new-component",
            "description": "A new test component",
            "tower_id": test_tower.id,
            "status": "planning",
            "complexity": "high"
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "New Component"
    assert data["slug"] == "new-component"
    assert data["tower_id"] == test_tower.id


def test_create_component_duplicate_slug(client, authenticated_headers, test_component):
    """Test creating component with duplicate slug."""
    response = client.post("/api/components/", 
        headers=authenticated_headers,
        json={
            "name": "Another Component",
            "slug": test_component.slug,
            "description": "Another test component",
            "tower_id": test_component.tower_id,
            "status": "planning",
            "complexity": "medium"
        }
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"]


def test_create_component_invalid_tower(client, authenticated_headers):
    """Test creating component with invalid tower ID."""
    response = client.post("/api/components/", 
        headers=authenticated_headers,
        json={
            "name": "Invalid Tower Component",
            "slug": "invalid-tower-component",
            "description": "Component with invalid tower",
            "tower_id": 99999,
            "status": "planning",
            "complexity": "medium"
        }
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Tower not found" in response.json()["detail"]


def test_get_components(client, authenticated_headers, test_component):
    """Test getting list of components."""
    response = client.get("/api/components/", headers=authenticated_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["id"] == test_component.id


def test_get_component_by_id(client, authenticated_headers, test_component):
    """Test getting component by ID."""
    response = client.get(f"/api/components/{test_component.id}", headers=authenticated_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_component.id
    assert data["name"] == test_component.name


def test_get_nonexistent_component(client, authenticated_headers):
    """Test getting nonexistent component."""
    response = client.get("/api/components/99999", headers=authenticated_headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_component(client, authenticated_headers, test_component):
    """Test updating a component."""
    response = client.put(f"/api/components/{test_component.id}",
        headers=authenticated_headers,
        json={
            "name": "Updated Component Name",
            "description": "Updated description"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Updated Component Name"
    assert data["description"] == "Updated description"


def test_delete_component(client, authenticated_headers, test_component):
    """Test deleting a component."""
    response = client.delete(f"/api/components/{test_component.id}", headers=authenticated_headers)
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify component is deleted
    response = client.get(f"/api/components/{test_component.id}", headers=authenticated_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_filter_components_by_tower(client, authenticated_headers, test_component):
    """Test filtering components by tower."""
    response = client.get(f"/api/components/?tower_id={test_component.tower_id}", headers=authenticated_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert all(comp["tower_id"] == test_component.tower_id for comp in data)


def test_filter_components_by_status(client, authenticated_headers, test_component):
    """Test filtering components by status."""
    response = client.get(f"/api/components/?status={test_component.status}", headers=authenticated_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert all(comp["status"] == test_component.status for comp in data)


def test_search_components(client, authenticated_headers, test_component):
    """Test searching components by name."""
    response = client.get(f"/api/components/?search=Test", headers=authenticated_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert any("Test" in comp["name"] for comp in data)


def test_unauthorized_access(client):
    """Test accessing components without authentication."""
    response = client.get("/api/components/")
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
