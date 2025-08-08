from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import SessionLocal
from models.course import Course
from schemas.course import CourseCreate, CourseOut
from utils.auth import get_current_user, require_admin
from sqlalchemy import or_, func

router = APIRouter(prefix="/courses", tags=["Courses"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ Authenticated route — List all courses
@router.get("/", response_model=list[CourseOut])
def list_courses(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)  # ⬅ added to protect access
):
    return db.query(Course).all()

# ✅ Admin-only route — Add course
@router.post("/", response_model=CourseOut)
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin)
):
    new_course = Course(**course.model_dump())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

@router.get("/search", response_model=list[CourseOut])
def search_courses(
    keyword: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
    limit: int = 10
):
    keyword_filter = f"%{keyword.lower()}%"
    results = db.query(Course).filter(
        or_(
            func.lower(Course.title).like(keyword_filter),
            func.lower(Course.description).like(keyword_filter)
        )
    ).limit(limit).all()
    return results