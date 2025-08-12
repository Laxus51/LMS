from sqlalchemy.orm import Session
from models.progress import Progress
from models.module import Module
from models.user import User
from fastapi import HTTPException
from typing import List, Optional

def mark_module_completed(db: Session, user_id: int, module_id: int) -> Progress:
    """Mark a module as completed for a specific user."""
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify module exists
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    try:
        progress = db.query(Progress).filter_by(user_id=user_id, module_id=module_id).first()
        
        if progress:
            progress.status = "completed"
        else:
            progress = Progress(user_id=user_id, module_id=module_id, status="completed")
            db.add(progress)
        
        db.commit()
        db.refresh(progress)
        return progress
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to mark module as completed: {str(e)}")

def get_user_progress(db: Session, user_id: int) -> List[Progress]:
    """Get all progress records for a specific user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return db.query(Progress).filter(Progress.user_id == user_id).all()

def get_module_progress(db: Session, module_id: int) -> List[Progress]:
    """Get all progress records for a specific module."""
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    return db.query(Progress).filter(Progress.module_id == module_id).all()
