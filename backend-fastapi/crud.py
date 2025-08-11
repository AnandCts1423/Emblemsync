"""CRUD operations for database models."""

from sqlalchemy.orm import Session, selectinload
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import models
import schemas
from auth import get_password_hash


# User CRUD
def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """Create a new user."""
    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=get_password_hash(user.password),
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user(db: Session, user_id: int) -> Optional[models.User]:
    """Get user by ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Get user by email."""
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    """Get list of users with pagination."""
    return db.query(models.User).offset(skip).limit(limit).all()


def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate) -> Optional[models.User]:
    """Update user by ID."""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    
    for field, value in user_update.model_dump(exclude_unset=True).items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    """Delete user by ID."""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True


# Tower CRUD
def create_tower(db: Session, tower: schemas.TowerCreate) -> models.Tower:
    """Create a new tower."""
    db_tower = models.Tower(**tower.model_dump())
    db.add(db_tower)
    db.commit()
    db.refresh(db_tower)
    return db_tower


def get_tower(db: Session, tower_id: int) -> Optional[models.Tower]:
    """Get tower by ID."""
    return db.query(models.Tower).filter(models.Tower.id == tower_id).first()


def get_towers(db: Session, skip: int = 0, limit: int = 100) -> List[models.Tower]:
    """Get list of towers with pagination."""
    return db.query(models.Tower).offset(skip).limit(limit).all()


def update_tower(db: Session, tower_id: int, tower_update: schemas.TowerUpdate) -> Optional[models.Tower]:
    """Update tower by ID."""
    db_tower = db.query(models.Tower).filter(models.Tower.id == tower_id).first()
    if not db_tower:
        return None
    
    for field, value in tower_update.model_dump(exclude_unset=True).items():
        setattr(db_tower, field, value)
    
    db.commit()
    db.refresh(db_tower)
    return db_tower


def delete_tower(db: Session, tower_id: int) -> bool:
    """Delete tower by ID."""
    db_tower = db.query(models.Tower).filter(models.Tower.id == tower_id).first()
    if not db_tower:
        return False
    
    db.delete(db_tower)
    db.commit()
    return True


# Component CRUD
def create_component(db: Session, component: schemas.ComponentCreate, user_id: int) -> models.Component:
    """Create a new component."""
    db_component = models.Component(
        **component.model_dump(),
        created_by=user_id
    )
    db.add(db_component)
    db.commit()
    db.refresh(db_component)
    return db_component


def get_component(db: Session, component_id: int) -> Optional[models.Component]:
    """Get component by ID with relationships."""
    return db.query(models.Component).options(
        selectinload(models.Component.tower),
        selectinload(models.Component.creator),
        selectinload(models.Component.releases),
        selectinload(models.Component.files)
    ).filter(models.Component.id == component_id).first()


def get_component_by_slug(db: Session, slug: str) -> Optional[models.Component]:
    """Get component by slug."""
    return db.query(models.Component).filter(models.Component.slug == slug).first()


def get_components(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    tower_id: Optional[int] = None,
    status: Optional[str] = None,
    complexity: Optional[str] = None,
    search: Optional[str] = None
) -> List[models.Component]:
    """Get list of components with filtering and pagination."""
    query = db.query(models.Component).options(
        selectinload(models.Component.tower),
        selectinload(models.Component.creator)
    )
    
    if tower_id:
        query = query.filter(models.Component.tower_id == tower_id)
    
    if status:
        query = query.filter(models.Component.status == status)
    
    if complexity:
        query = query.filter(models.Component.complexity == complexity)
    
    if search:
        query = query.filter(
            or_(
                models.Component.name.ilike(f"%{search}%"),
                models.Component.description.ilike(f"%{search}%")
            )
        )
    
    return query.offset(skip).limit(limit).all()


def update_component(db: Session, component_id: int, component_update: schemas.ComponentUpdate) -> Optional[models.Component]:
    """Update component by ID."""
    db_component = db.query(models.Component).filter(models.Component.id == component_id).first()
    if not db_component:
        return None
    
    for field, value in component_update.model_dump(exclude_unset=True).items():
        setattr(db_component, field, value)
    
    db_component.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_component)
    return db_component


def delete_component(db: Session, component_id: int) -> bool:
    """Delete component by ID."""
    db_component = db.query(models.Component).filter(models.Component.id == component_id).first()
    if not db_component:
        return False
    
    db.delete(db_component)
    db.commit()
    return True


# Release CRUD
def create_release(db: Session, release: schemas.ReleaseCreate) -> models.Release:
    """Create a new release."""
    db_release = models.Release(**release.model_dump())
    db.add(db_release)
    db.commit()
    db.refresh(db_release)
    return db_release


def get_release(db: Session, release_id: int) -> Optional[models.Release]:
    """Get release by ID."""
    return db.query(models.Release).options(
        selectinload(models.Release.component)
    ).filter(models.Release.id == release_id).first()


def get_releases(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    component_id: Optional[int] = None
) -> List[models.Release]:
    """Get list of releases with pagination."""
    query = db.query(models.Release).options(
        selectinload(models.Release.component)
    ).order_by(desc(models.Release.released_at))
    
    if component_id:
        query = query.filter(models.Release.component_id == component_id)
    
    return query.offset(skip).limit(limit).all()


def update_release(db: Session, release_id: int, release_update: schemas.ReleaseUpdate) -> Optional[models.Release]:
    """Update release by ID."""
    db_release = db.query(models.Release).filter(models.Release.id == release_id).first()
    if not db_release:
        return None
    
    for field, value in release_update.model_dump(exclude_unset=True).items():
        setattr(db_release, field, value)
    
    db.commit()
    db.refresh(db_release)
    return db_release


def delete_release(db: Session, release_id: int) -> bool:
    """Delete release by ID."""
    db_release = db.query(models.Release).filter(models.Release.id == release_id).first()
    if not db_release:
        return False
    
    db.delete(db_release)
    db.commit()
    return True


# Activity CRUD
def create_activity(db: Session, activity: schemas.ActivityCreate) -> models.Activity:
    """Create a new activity."""
    db_activity = models.Activity(**activity.model_dump())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity


def get_activities(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    user_id: Optional[int] = None,
    component_id: Optional[int] = None,
    action_type: Optional[str] = None
) -> List[models.Activity]:
    """Get list of activities with filtering and pagination."""
    query = db.query(models.Activity).options(
        selectinload(models.Activity.user),
        selectinload(models.Activity.component)
    ).order_by(desc(models.Activity.created_at))
    
    if user_id:
        query = query.filter(models.Activity.user_id == user_id)
    
    if component_id:
        query = query.filter(models.Activity.component_id == component_id)
    
    if action_type:
        query = query.filter(models.Activity.action_type == action_type)
    
    return query.offset(skip).limit(limit).all()


# File CRUD
def create_file(db: Session, file: schemas.FileCreate) -> models.File:
    """Create a new file record."""
    db_file = models.File(**file.model_dump())
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file


def get_file(db: Session, file_id: int) -> Optional[models.File]:
    """Get file by ID."""
    return db.query(models.File).filter(models.File.id == file_id).first()


def get_files(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    component_id: Optional[int] = None
) -> List[models.File]:
    """Get list of files with pagination."""
    query = db.query(models.File).options(
        selectinload(models.File.component),
        selectinload(models.File.uploader)
    ).order_by(desc(models.File.uploaded_at))
    
    if component_id:
        query = query.filter(models.File.component_id == component_id)
    
    return query.offset(skip).limit(limit).all()


def delete_file(db: Session, file_id: int) -> bool:
    """Delete file by ID."""
    db_file = db.query(models.File).filter(models.File.id == file_id).first()
    if not db_file:
        return False
    
    db.delete(db_file)
    db.commit()
    return True


# Analytics helpers
def get_component_count(db: Session) -> int:
    """Get total component count."""
    return db.query(models.Component).count()


def get_tower_count(db: Session) -> int:
    """Get total tower count."""
    return db.query(models.Tower).count()


def get_components_by_status(db: Session) -> List[Dict[str, Any]]:
    """Get component distribution by status."""
    return db.query(
        models.Component.status,
        func.count(models.Component.id).label("count")
    ).group_by(models.Component.status).all()


def get_components_by_complexity(db: Session) -> List[Dict[str, Any]]:
    """Get component distribution by complexity."""
    return db.query(
        models.Component.complexity,
        func.count(models.Component.id).label("count")
    ).group_by(models.Component.complexity).all()


def get_monthly_releases(db: Session) -> List[Dict[str, Any]]:
    """Get monthly release trends."""
    return db.query(
        func.strftime("%Y-%m", models.Release.released_at).label("month"),
        func.count(models.Release.id).label("count")
    ).group_by(func.strftime("%Y-%m", models.Release.released_at)).all()
