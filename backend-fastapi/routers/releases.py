"""Release management routes."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_active_user
import schemas
import crud

router = APIRouter(prefix="/releases", tags=["releases"])


@router.post("/", response_model=schemas.Release, status_code=status.HTTP_201_CREATED)
def create_release(
    release: schemas.ReleaseCreate,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new release."""
    # Check if component exists
    component = crud.get_component(db, release.component_id)
    if not component:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Component not found"
        )
    
    db_release = crud.create_release(db=db, release=release)
    
    # Log activity
    activity = schemas.ActivityCreate(
        user_id=current_user.id,
        component_id=release.component_id,
        action_type="release_created",
        meta={
            "component_name": component.name,
            "version": db_release.version
        }
    )
    crud.create_activity(db=db, activity=activity)
    
    return db_release


@router.get("/", response_model=List[schemas.Release])
def read_releases(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    component_id: Optional[int] = Query(None),
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of releases with filtering."""
    releases = crud.get_releases(
        db, 
        skip=skip, 
        limit=limit,
        component_id=component_id
    )
    return releases


@router.get("/{release_id}", response_model=schemas.Release)
def read_release(
    release_id: int,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get release by ID."""
    db_release = crud.get_release(db, release_id=release_id)
    if db_release is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Release not found"
        )
    return db_release


@router.put("/{release_id}", response_model=schemas.Release)
def update_release(
    release_id: int,
    release_update: schemas.ReleaseUpdate,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update release by ID."""
    db_release = crud.update_release(db, release_id=release_id, release_update=release_update)
    if db_release is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Release not found"
        )
    
    # Log activity
    activity = schemas.ActivityCreate(
        user_id=current_user.id,
        component_id=db_release.component_id,
        action_type="release_updated",
        meta={
            "version": db_release.version,
            "changes": release_update.model_dump(exclude_unset=True)
        }
    )
    crud.create_activity(db=db, activity=activity)
    
    return db_release


@router.delete("/{release_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_release(
    release_id: int,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete release by ID."""
    # Get release info for logging
    db_release = crud.get_release(db, release_id)
    if not db_release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Release not found"
        )
    
    version = db_release.version
    component_id = db_release.component_id
    success = crud.delete_release(db, release_id=release_id)
    
    if success:
        # Log activity
        activity = schemas.ActivityCreate(
            user_id=current_user.id,
            component_id=component_id,
            action_type="release_deleted",
            meta={"version": version}
        )
        crud.create_activity(db=db, activity=activity)
