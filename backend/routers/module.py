from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from services.module_service import create_module, get_modules_by_course
from schemas.module import ModuleCreate, ModuleOut
from utils.auth import get_current_user, require_admin
from core.response import success_response, error_response
from typing import List

router = APIRouter(prefix="/courses", tags=["Modules"])

@router.post("/{course_id}/modules", response_model=ModuleOut)
def add_module(
    course_id: int,
    module: ModuleCreate,
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin)
):
    """Add a new module to a course (Admin only)."""
    try:
        created_module = create_module(db, course_id, module)
        return success_response(data=ModuleOut.model_validate(created_module).model_dump(mode="json"), message="Module created successfully")
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)

@router.get("/{course_id}/modules", response_model=List[ModuleOut])
def list_modules(
    course_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get all modules for a specific course."""
    try:
        modules = get_modules_by_course(db, course_id)
        return success_response(data=[ModuleOut.model_validate(m).model_dump(mode="json") for m in modules], message="Modules retrieved successfully")
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)
