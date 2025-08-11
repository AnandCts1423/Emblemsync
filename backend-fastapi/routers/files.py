"""File upload and management routes."""

import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_active_user
from config import settings
from file_processor import process_uploaded_file, is_allowed_file
from websocket_manager import manager
import schemas
import crud
import models

router = APIRouter(prefix="/files", tags=["files"])

# Ensure upload directory exists
os.makedirs(settings.upload_dir, exist_ok=True)


@router.post("/upload-preview")
async def upload_preview(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload and preview file content without saving to database."""
    try:
        # Validate file
        if not is_allowed_file(file.filename, file.content_type):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File type not supported. Please upload CSV, Excel, or JSON files."
            )
        
        # Read file content
        file_content = await file.read()
        
        # Broadcast upload progress
        await manager.broadcast_upload_progress(
            filename=file.filename,
            progress=50,
            status="processing"
        )
        
        # Process file
        components_data, errors, metadata = process_uploaded_file(
            file_content, 
            file.filename, 
            file.content_type
        )
        
        # Broadcast completion
        await manager.broadcast_upload_progress(
            filename=file.filename,
            progress=100,
            status="completed"
        )
        
        return {
            "success": True,
            "metadata": metadata,
            "components": components_data,
            "errors": errors,
            "preview_count": len(components_data),
            "error_count": len(errors)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await manager.broadcast_upload_progress(
            filename=file.filename or "unknown",
            progress=0,
            status="error"
        )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process file: {str(e)}"
        )


@router.post("/upload-save")
async def upload_and_save(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload file, process content, and save components to database with auto tower creation."""
    try:
        
        # Process file
        file_content = await file.read()
        components_data, errors, metadata = process_uploaded_file(
            file_content,
            file.filename,
            file.content_type
        )
        
        if not components_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid components found in file"
            )
        
        # Save file to disk
        file_path = os.path.join(settings.upload_dir, f"{current_user.id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # Save components to database
        saved_components = []
        component_errors = []
        towers_created = []
        
        for idx, comp_data in enumerate(components_data):
            try:
                # Get or create tower
                tower_name = comp_data.get('tower_name', 'Default Tower')
                
                # Try to find existing tower
                tower = db.query(models.Tower).filter(models.Tower.name == tower_name).first()
                
                if not tower:
                    # Create new tower
                    tower_create = schemas.TowerCreate(
                        name=tower_name,
                        description=f"Auto-created from file upload: {file.filename}",
                        ownership="Auto-Generated"
                    )
                    tower = crud.create_tower(db, tower_create)
                    towers_created.append(tower)
                    print(f"   ✅ Auto-created tower: {tower.name}")
                
                # Check if slug already exists
                existing = crud.get_component_by_slug(db, comp_data['slug'])
                if existing:
                    comp_data['slug'] = f"{comp_data['slug']}-{idx + 1}"
                
                # Create component
                component_create = schemas.ComponentCreate(
                    name=comp_data['name'],
                    slug=comp_data['slug'],
                    description=comp_data.get('description'),
                    tower_id=tower.id,
                    status=comp_data.get('status', 'planning'),
                    complexity=comp_data.get('complexity', 'medium'),
                    tech_stack=comp_data.get('tech_stack')
                )
                
                db_component = crud.create_component(db, component_create, current_user.id)
                saved_components.append(db_component)
                
                # Create file record
                file_record = schemas.FileCreate(
                    component_id=db_component.id,
                    filename=file.filename,
                    content_type=file.content_type,
                    file_size=len(file_content),
                    path=file_path,
                    uploaded_by=current_user.id
                )
                crud.create_file(db, file_record)
                
                # Log activity
                activity = schemas.ActivityCreate(
                    user_id=current_user.id,
                    component_id=db_component.id,
                    action_type="component_created_from_upload",
                    meta={
                        "filename": file.filename,
                        "component_name": db_component.name
                    }
                )
                crud.create_activity(db, activity)
                
                # Broadcast component creation
                await manager.broadcast_component_update(
                    action="created",
                    component_data={
                        "id": db_component.id,
                        "name": db_component.name,
                        "tower": tower.name,
                        "user": current_user.name
                    }
                )
                
            except Exception as e:
                component_errors.append(f"Component '{comp_data.get('name', 'Unknown')}': {str(e)}")
        
        return {
            "success": True,
            "message": f"Successfully saved {len(saved_components)} components",
            "metadata": metadata,
            "saved_count": len(saved_components),
            "error_count": len(component_errors),
            "towers_created": len(towers_created),
            "towers_created_list": [tower.name for tower in towers_created],
            "errors": errors + component_errors,
            "components": [
                {
                    "id": comp.id,
                    "name": comp.name,
                    "slug": comp.slug,
                    "status": comp.status,
                    "tower_name": comp.tower.name if comp.tower else None
                }
                for comp in saved_components
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save components: {str(e)}"
        )


@router.get("/", response_model=List[schemas.File])
def get_files(
    skip: int = 0,
    limit: int = 100,
    component_id: int = None,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of uploaded files."""
    files = crud.get_files(db, skip=skip, limit=limit, component_id=component_id)
    return files


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete file by ID."""
    db_file = crud.get_file(db, file_id)
    if not db_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Remove physical file
    if os.path.exists(db_file.path):
        os.remove(db_file.path)
    
    # Remove database record
    success = crud.delete_file(db, file_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
