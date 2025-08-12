from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from models.course import Course
from schemas.course import CourseCreate
from fastapi import HTTPException
from typing import List, Optional

def get_all_courses(db: Session) -> List[Course]:
    """Retrieve all courses from the database."""
    return db.query(Course).all()

def create_course(db: Session, course_data: CourseCreate) -> Course:
    """Create a new course in the database."""
    try:
        new_course = Course(**course_data.model_dump())
        db.add(new_course)
        db.commit()
        db.refresh(new_course)
        return new_course
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create course: {str(e)}")

def search_courses(db: Session, keyword: str, limit: int = 10) -> List[Course]:
    """Search courses by keyword in title or description."""
    if not keyword or not keyword.strip():
        raise HTTPException(status_code=400, detail="Search keyword cannot be empty")
    
    keyword_filter = f"%{keyword.lower()}%"
    results = db.query(Course).filter(
        or_(
            func.lower(Course.title).like(keyword_filter),
            func.lower(Course.description).like(keyword_filter)
        )
    ).limit(limit).all()
    
    if not results:
        raise HTTPException(status_code=404, detail="No courses found")
    
    return results

def get_course_by_id(db: Session, course_id: int) -> Optional[Course]:
    """Get a course by its ID."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course