"""Activity feed routes."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_active_user
import schemas
import crud

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("/", response_model=List[schemas.Activity])
def read_activities(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),  # Lower default for activity feeds
    user_id: Optional[int] = Query(None),
    component_id: Optional[int] = Query(None),
    action_type: Optional[str] = Query(None),
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of activities with filtering."""
    activities = crud.get_activities(
        db,
        skip=skip,
        limit=limit,
        user_id=user_id,
        component_id=component_id,
        action_type=action_type
    )
    return activities
