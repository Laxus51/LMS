from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import SessionLocal
from services import module_service
from schemas.module import ModuleCreate, ModuleOut
from utils.auth import get_current_user, require_admin

router = APIRouter(prefix="/courses", tags=["Modules"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/{course_id}/modules", response_model=ModuleOut)
def add_module(course_id: int, module: ModuleCreate, db: Session = Depends(get_db), admin_user=Depends(require_admin)):
    return module_service.create_module(db, course_id, module)

@router.get("/{course_id}/modules", response_model=list[ModuleOut])
def list_modules(course_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return module_service.get_modules_by_course(db, course_id)
