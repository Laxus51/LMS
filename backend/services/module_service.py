from sqlalchemy.orm import Session
from models.module import Module
from models.course import Course
from schemas.module import ModuleCreate
from fastapi import HTTPException
from typing import List, Optional

def create_module(db: Session, course_id: int, module_data: ModuleCreate) -> Module:
    """Create a new module for a specific course."""
    # Verify course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    try:
        new_module = Module(**module_data.model_dump(), course_id=course_id)
        db.add(new_module)
        db.commit()
        db.refresh(new_module)
        return new_module
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create module: {str(e)}")

def get_modules_by_course(db: Session, course_id: int) -> List[Module]:
    """Get all modules for a specific course."""
    # Verify course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    modules = db.query(Module).filter(Module.course_id == course_id).all()
    if not modules:
        raise HTTPException(status_code=404, detail="No modules found for this course")
    
    return modules

def get_module_by_id(db: Session, module_id: int) -> Optional[Module]:
    """Get a module by its ID."""
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module
