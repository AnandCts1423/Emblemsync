"""SQLAlchemy 2.0 models for EmblemHealth Component Tracker."""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from database import Base
from typing import Optional, List
from datetime import datetime


class User(Base):
    """User model for authentication and authorization."""
    
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="user", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_active: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    created_components: Mapped[List["Component"]] = relationship("Component", back_populates="creator")
    activities: Mapped[List["Activity"]] = relationship("Activity", back_populates="user")
    uploaded_files: Mapped[List["File"]] = relationship("File", back_populates="uploader")


class Tower(Base):
    """Tower model for organizing components by business domain."""
    
    __tablename__ = "towers"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ownership: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    components: Mapped[List["Component"]] = relationship("Component", back_populates="tower")


class Component(Base):
    """Component model for tracking software components."""
    
    __tablename__ = "components"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tower_id: Mapped[int] = mapped_column(Integer, ForeignKey("towers.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="planning", index=True)
    complexity: Mapped[str] = mapped_column(String(20), default="medium", index=True)
    tech_stack: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    tower: Mapped["Tower"] = relationship("Tower", back_populates="components")
    creator: Mapped["User"] = relationship("User", back_populates="created_components")
    releases: Mapped[List["Release"]] = relationship("Release", back_populates="component")
    activities: Mapped[List["Activity"]] = relationship("Activity", back_populates="component")
    files: Mapped[List["File"]] = relationship("File", back_populates="component")


class Release(Base):
    """Release model for tracking component versions."""
    
    __tablename__ = "releases"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    component_id: Mapped[int] = mapped_column(Integer, ForeignKey("components.id"), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    component: Mapped["Component"] = relationship("Component", back_populates="releases")


class Activity(Base):
    """Activity model for tracking component actions and events."""
    
    __tablename__ = "activities"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    component_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("components.id"), nullable=True)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    meta: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="activities")
    component: Mapped[Optional["Component"]] = relationship("Component", back_populates="activities")


class File(Base):
    """File model for component-related file uploads."""
    
    __tablename__ = "files"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    component_id: Mapped[int] = mapped_column(Integer, ForeignKey("components.id"), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    uploaded_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    component: Mapped["Component"] = relationship("Component", back_populates="files")
    uploader: Mapped["User"] = relationship("User", back_populates="uploaded_files")
