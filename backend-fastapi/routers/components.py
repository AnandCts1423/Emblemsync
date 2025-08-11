"""Component management routes."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_active_user
from websocket_manager import manager
import schemas
import crud

router = APIRouter(prefix="/components", tags=["components"])


@router.post("/", response_model=schemas.Component, status_code=status.HTTP_201_CREATED)
async def create_component(
    component: schemas.ComponentCreate,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new component."""
    # Check if slug already exists
    existing = crud.get_component_by_slug(db, component.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Component with this slug already exists"
        )
    
    # Check if tower exists
    tower = crud.get_tower(db, component.tower_id)
    if not tower:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tower not found"
        )
    
    db_component = crud.create_component(db=db, component=component, user_id=current_user.id)
    
    # Log activity
    activity = schemas.ActivityCreate(
        user_id=current_user.id,
        component_id=db_component.id,
        action_type="component_created",
        meta={"component_name": db_component.name}
    )
    crud.create_activity(db=db, activity=activity)
    
    return db_component


@router.get("/", response_model=List[schemas.Component])
def read_components(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    tower_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    complexity: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of components with filtering."""
    components = crud.get_components(
        db, 
        skip=skip, 
        limit=limit,
        tower_id=tower_id,
        status=status,
        complexity=complexity,
        search=search
    )
    return components


@router.get("/{component_id}", response_model=schemas.Component)
def read_component(
    component_id: int,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get component by ID."""
    db_component = crud.get_component(db, component_id=component_id)
    if db_component is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Component not found"
        )
    return db_component


@router.put("/{component_id}", response_model=schemas.Component)
async def update_component(
    component_id: int,
    component_update: schemas.ComponentUpdate,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update component by ID."""
    db_component = crud.update_component(db, component_id=component_id, component_update=component_update)
    if db_component is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Component not found"
        )
    
    # Log activity
    activity = schemas.ActivityCreate(
        user_id=current_user.id,
        component_id=component_id,
        action_type="component_updated",
        meta={"component_name": db_component.name, "changes": component_update.model_dump(exclude_unset=True)}
    )
    crud.create_activity(db=db, activity=activity)
    
    return db_component


@router.delete("/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_component(
    component_id: int,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete component by ID."""
    # Get component name for logging
    db_component = crud.get_component(db, component_id)
    if not db_component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Component not found"
        )
    
    component_name = db_component.name
    success = crud.delete_component(db, component_id=component_id)
    
    if success:
        # Log activity
        activity = schemas.ActivityCreate(
            user_id=current_user.id,
            component_id=None,  # Component is deleted
            action_type="component_deleted",
            meta={"component_name": component_name}
        )
        crud.create_activity(db=db, activity=activity)
        
        # Broadcast component deletion
        await manager.broadcast_component_update(
            action="deleted",
            component_data={
                "id": component_id,
                "name": component_name,
                "user": current_user.name
            }
        )


@router.get("/{component_id}/releases", response_model=List[schemas.Release])
def read_component_releases(
    component_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get releases for a specific component."""
    # Check if component exists
    db_component = crud.get_component(db, component_id)
    if not db_component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Component not found"
        )
    
    releases = crud.get_releases(db, skip=skip, limit=limit, component_id=component_id)
    return releases
