from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from core.database import get_db
from utils.auth import get_current_user
from core.response import success_response, error_response
from models.progress import Progress
from models.module import Module
from models.course import Course
from typing import Optional

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get dashboard statistics for the current user."""
    try:
        user_id = user["id"]
        
        # Get total completed modules
        completed_modules_count = db.query(Progress).filter(
            Progress.user_id == user_id,
            Progress.status == "completed"
        ).count()
        
        # Get total completed courses (courses where all modules are completed)
        # First, get all courses with their module counts
        courses_with_module_counts = db.query(
            Course.id,
            func.count(Module.id).label('total_modules')
        ).join(Module, Course.id == Module.course_id).group_by(Course.id).subquery()
        
        # Then, get courses where user has completed all modules
        completed_courses_subquery = db.query(
            Module.course_id,
            func.count(Progress.id).label('completed_modules')
        ).join(
            Progress, 
            (Module.id == Progress.module_id) & 
            (Progress.user_id == user_id) & 
            (Progress.status == "completed")
        ).group_by(Module.course_id).subquery()
        
        # Count courses where completed_modules = total_modules
        completed_courses_count = db.query(
            courses_with_module_counts
        ).join(
            completed_courses_subquery,
            courses_with_module_counts.c.id == completed_courses_subquery.c.course_id
        ).filter(
            courses_with_module_counts.c.total_modules == completed_courses_subquery.c.completed_modules
        ).count()
        
        # Get last viewed course/module (most recent progress entry)
        last_progress = db.query(Progress).filter(
            Progress.user_id == user_id
        ).order_by(desc(Progress.updated_at)).first()
        
        last_viewed_info = None
        if last_progress:
            # Get module and course information
            module = db.query(Module).filter(Module.id == last_progress.module_id).first()
            if module:
                course = db.query(Course).filter(Course.id == module.course_id).first()
                if course:
                    last_viewed_info = {
                        "course_id": course.id,
                        "course_title": course.title,
                        "module_id": module.id,
                        "module_title": module.title,
                        "status": last_progress.status,
                        "last_accessed": last_progress.updated_at.isoformat() if last_progress.updated_at else None
                    }
        
        stats = {
            "completed_courses": completed_courses_count,
            "completed_modules": completed_modules_count,
            "last_viewed": last_viewed_info
        }
        
        return success_response(
            data=stats,
            message="Dashboard statistics retrieved successfully"
        )
        
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)