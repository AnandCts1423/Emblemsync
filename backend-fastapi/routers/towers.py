"""Tower management routes."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_active_user
import schemas
import crud

router = APIRouter(prefix="/towers", tags=["towers"])


@router.post("/", response_model=schemas.Tower, status_code=status.HTTP_201_CREATED)
def create_tower(
    tower: schemas.TowerCreate,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new tower."""
    return crud.create_tower(db=db, tower=tower)


@router.get("/", response_model=List[schemas.Tower])
def read_towers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of towers."""
    towers = crud.get_towers(db, skip=skip, limit=limit)
    return towers


@router.get("/{tower_id}", response_model=schemas.Tower)
def read_tower(
    tower_id: int,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get tower by ID."""
    db_tower = crud.get_tower(db, tower_id=tower_id)
    if db_tower is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tower not found"
        )
    return db_tower


@router.put("/{tower_id}", response_model=schemas.Tower)
def update_tower(
    tower_id: int,
    tower_update: schemas.TowerUpdate,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update tower by ID."""
    db_tower = crud.update_tower(db, tower_id=tower_id, tower_update=tower_update)
    if db_tower is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tower not found"
        )
    return db_tower


@router.delete("/{tower_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tower(
    tower_id: int,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete tower by ID."""
    success = crud.delete_tower(db, tower_id=tower_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tower not found"
        )
