"""Test configuration and fixtures."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import get_db, Base
from config import settings
import models
import crud
import schemas

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    poolclass=StaticPool,
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db):
    """Create test client with database dependency override."""
    def override_get_db():
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db):
    """Create a test user."""
    user_data = schemas.UserCreate(
        name="Test User",
        email="test@emblemhealth.com",
        password="testpassword123",
        role="user"
    )
    return crud.create_user(db, user_data)


@pytest.fixture
def admin_user(db):
    """Create a test admin user."""
    user_data = schemas.UserCreate(
        name="Admin User",
        email="admin@emblemhealth.com",
        password="adminpassword123",
        role="admin"
    )
    return crud.create_user(db, user_data)


@pytest.fixture
def test_tower(db):
    """Create a test tower."""
    tower_data = schemas.TowerCreate(
        name="Test Tower",
        description="Test tower for testing",
        ownership="Test Team"
    )
    return crud.create_tower(db, tower_data)


@pytest.fixture
def test_component(db, test_user, test_tower):
    """Create a test component."""
    component_data = schemas.ComponentCreate(
        name="Test Component",
        slug="test-component",
        description="Test component for testing",
        tower_id=test_tower.id,
        status="planning",
        complexity="medium"
    )
    return crud.create_component(db, component_data, test_user.id)


@pytest.fixture
def authenticated_headers(client, test_user):
    """Get authentication headers for test user."""
    response = client.post("/api/auth/login", json={
        "email": test_user.email,
        "password": "testpassword123"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client, admin_user):
    """Get authentication headers for admin user."""
    response = client.post("/api/auth/login", json={
        "email": admin_user.email,
        "password": "adminpassword123"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
