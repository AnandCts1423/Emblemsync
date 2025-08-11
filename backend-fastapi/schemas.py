"""Pydantic schemas for API request/response models."""

from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


# Base schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "user"


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class User(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    is_active: bool
    last_active: Optional[datetime] = None
    created_at: datetime


class UserInDB(User):
    password_hash: str


# Tower schemas
class TowerBase(BaseModel):
    name: str
    description: Optional[str] = None
    ownership: Optional[str] = None


class TowerCreate(TowerBase):
    pass


class TowerUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    ownership: Optional[str] = None


class Tower(TowerBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime


# Component schemas
class ComponentBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    tower_id: int
    status: str = "planning"
    complexity: str = "medium"
    tech_stack: Optional[Dict[str, Any]] = None


class ComponentCreate(ComponentBase):
    pass


class ComponentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    complexity: Optional[str] = None
    tech_stack: Optional[Dict[str, Any]] = None


class Component(ComponentBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    tower: Optional[Tower] = None
    creator: Optional[User] = None


# Release schemas
class ReleaseBase(BaseModel):
    component_id: int
    version: str
    released_at: datetime
    notes: Optional[str] = None


class ReleaseCreate(ReleaseBase):
    pass


class ReleaseUpdate(BaseModel):
    version: Optional[str] = None
    released_at: Optional[datetime] = None
    notes: Optional[str] = None


class Release(ReleaseBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    component: Optional[Component] = None


# Activity schemas
class ActivityBase(BaseModel):
    action_type: str
    component_id: Optional[int] = None
    meta: Optional[Dict[str, Any]] = None


class ActivityCreate(ActivityBase):
    user_id: int


class Activity(ActivityBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    created_at: datetime
    user: Optional[User] = None
    component: Optional[Component] = None


# File schemas
class FileBase(BaseModel):
    component_id: int
    filename: str
    content_type: str
    file_size: int


class FileCreate(FileBase):
    path: str
    uploaded_by: int


class File(FileBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    path: str
    uploaded_by: int
    uploaded_at: datetime
    component: Optional[Component] = None
    uploader: Optional[User] = None


# Auth schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Pagination schemas
class PaginationParams(BaseModel):
    skip: int = 0
    limit: int = 100


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    skip: int
    limit: int
    has_next: bool
    has_prev: bool


# Health check schema
class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    version: str
