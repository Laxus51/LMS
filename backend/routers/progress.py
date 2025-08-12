from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from utils.auth import get_current_user
from services.progress_service import mark_module_completed
from schemas.progress import ProgressOut
from core.response import success_response, error_response

router = APIRouter(prefix="/modules", tags=["Progress"])

@router.post("/{module_id}/complete", response_model=ProgressOut)
def complete_module(
    module_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Mark a module as completed (Students only)."""
    try:
        if user["role"] != "user":
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
