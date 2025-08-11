"""Test authentication endpoints."""

import pytest
from fastapi import status


def test_register_user(client):
    """Test user registration."""
    response = client.post("/api/auth/register", json={
        "name": "New User",
        "email": "newuser@emblemhealth.com",
        "password": "newpassword123",
        "role": "user"
    })
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newuser@emblemhealth.com"
    assert data["name"] == "New User"
    assert data["role"] == "user"
    assert "password" not in data


def test_register_duplicate_email(client, test_user):
    """Test registration with duplicate email."""
    response = client.post("/api/auth/register", json={
        "name": "Another User",
        "email": test_user.email,
        "password": "password123",
        "role": "user"
    })
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Email already registered" in response.json()["detail"]


def test_login_success(client, test_user):
    """Test successful login."""
    response = client.post("/api/auth/login", json={
        "email": test_user.email,
        "password": "testpassword123"
    })
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client, test_user):
    """Test login with invalid credentials."""
    response = client.post("/api/auth/login", json={
        "email": test_user.email,
        "password": "wrongpassword"
    })
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_nonexistent_user(client):
    """Test login with nonexistent user."""
    response = client.post("/api/auth/login", json={
        "email": "nonexistent@emblemhealth.com",
        "password": "password123"
    })
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_current_user(client, authenticated_headers):
    """Test getting current user information."""
    response = client.get("/api/auth/me", headers=authenticated_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "test@emblemhealth.com"
    assert data["name"] == "Test User"


def test_get_current_user_unauthorized(client):
    """Test getting current user without authentication."""
    response = client.get("/api/auth/me")
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_update_current_user(client, authenticated_headers):
    """Test updating current user information."""
    response = client.put("/api/auth/me", 
        headers=authenticated_headers,
        json={
            "name": "Updated Test User"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Updated Test User"
