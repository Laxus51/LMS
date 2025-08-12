from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.course import CourseCreate, CourseOut
from services.course_service import get_all_courses, create_course, search_courses
from utils.auth import get_current_user, require_admin
from core.response import success_response, error_response
from typing import List

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("/", response_model=List[CourseOut])
def list_courses(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get all available courses."""
    try:
        courses = get_all_courses(db)
        return success_response(data=[CourseOut.model_validate(c).model_dump(mode="json") for c in courses], message="Courses retrieved successfully")
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)

@router.post("/", response_model=CourseOut)
def create_new_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin)
):
    """Create a new course (Admin only)."""
    try:
        new_course = create_course(db, course)
        return success_response(data=CourseOut.model_validate(new_course).model_dump(mode="json"), message="Course created successfully")
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)

@router.get("/search", response_model=List[CourseOut])
def search_courses_endpoint(
    keyword: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
    limit: int = 10
):
    """Search courses by keyword."""
    try:
        results = search_courses(db, keyword, limit)
        return success_response(data=[CourseOut.model_validate(c).model_dump(mode="json") for c in results], message="Courses search results")
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)
