from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from utils.auth import get_current_user
from services.progress_service import mark_module_completed, get_user_progress, unmark_module_completed
from schemas.progress import ProgressOut
from core.response import success_response, error_response
from models.user import UserRole
from typing import List

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.post("/modules/{module_id}/complete", response_model=ProgressOut)
def complete_module(
    module_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Mark a module as completed (Students only)."""
    try:
        if user["role"] not in [UserRole.FREE, UserRole.PREMIUM]:
            return error_response(message="Only students can complete modules", status_code=403)

        progress = mark_module_completed(db, user_id=user["id"], module_id=module_id)
        return success_response(
            data=ProgressOut.model_validate(progress).model_dump(mode="json"),
            message="Module marked as completed"
        )
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)

@router.post("/modules/{module_id}/uncomplete", response_model=ProgressOut)
def uncomplete_module(
    module_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Unmark a module as completed (Students only)."""
    try:
        if user["role"] not in [UserRole.FREE, UserRole.PREMIUM]:
            return error_response(message="Only students can uncomplete modules", status_code=403)

        progress = unmark_module_completed(db, user_id=user["id"], module_id=module_id)
        return success_response(
            data=ProgressOut.model_validate(progress).model_dump(mode="json"),
            message="Module unmarked as completed"
        )
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)

@router.get("/user", response_model=List[ProgressOut])
def get_current_user_progress(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get current user's progress for all modules."""
    try:
        progress_records = get_user_progress(db, user_id=user["id"])
        return success_response(
            data=[ProgressOut.model_validate(p).model_dump(mode="json") for p in progress_records],
            message="User progress retrieved successfully"
        )
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)
