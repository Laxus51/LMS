from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict
from core.database import get_db
from utils.auth import get_current_user
from services.study_plan_progress_service import StudyPlanProgressService
from schemas.study_plan_progress import (
    StudyPlanProgressResponse,
    StudyPlanProgressListResponse,
    StudyPlanProgressSummary
)
from core.response import success_response, error_response

router = APIRouter(prefix="/study-plans", tags=["study-plan-progress"])

@router.post("/{study_plan_id}/progress/days/{day_number}/toggle")
async def toggle_day_completion(
    study_plan_id: int,
    day_number: int,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle completion status of a specific day in a study plan"""
    try:
        progress = StudyPlanProgressService.toggle_day_completion(
            db, current_user["id"], study_plan_id, day_number
        )
        
        return success_response(
            data=StudyPlanProgressResponse.model_validate(progress).model_dump(mode="json"),
            message=f"Day {day_number} marked as {'completed' if progress.is_completed else 'incomplete'}"
        )
        
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)

@router.post("/{study_plan_id}/progress/days/{day_number}/complete")
async def mark_day_completed(
    study_plan_id: int,
    day_number: int,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a specific day as completed"""
    try:
        progress = StudyPlanProgressService.mark_day_completed(
            db, current_user["id"], study_plan_id, day_number
        )
        
        return success_response(
            data=StudyPlanProgressResponse.model_validate(progress).model_dump(mode="json"),
            message=f"Day {day_number} marked as completed"
        )
        
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)

@router.post("/{study_plan_id}/progress/days/{day_number}/incomplete")
async def mark_day_incomplete(
    study_plan_id: int,
    day_number: int,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a specific day as incomplete"""
    try:
        progress = StudyPlanProgressService.mark_day_incomplete(
            db, current_user["id"], study_plan_id, day_number
        )
        
        return success_response(
            data=StudyPlanProgressResponse.model_validate(progress).model_dump(mode="json"),
            message=f"Day {day_number} marked as incomplete"
        )
        
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)

@router.get("/{study_plan_id}/progress")
async def get_study_plan_progress(
    study_plan_id: int,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all progress records for a specific study plan"""
    try:
        progress_records = StudyPlanProgressService.get_study_plan_progress(
            db, current_user["id"], study_plan_id
        )
        
        # Get progress summary
        summary = StudyPlanProgressService.get_progress_summary(
            db, current_user["id"], study_plan_id
        )
        
        return success_response(
            data={
                "progress_records": [StudyPlanProgressResponse.model_validate(p).model_dump(mode="json") for p in progress_records],
                "summary": summary
            },
            message="Study plan progress retrieved successfully"
        )
        
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)

@router.get("/{study_plan_id}/progress/summary")
async def get_progress_summary(
    study_plan_id: int,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get progress summary for a study plan"""
    try:
        summary = StudyPlanProgressService.get_progress_summary(
            db, current_user["id"], study_plan_id
        )
        
        return success_response(
            data=summary,
            message="Progress summary retrieved successfully"
        )
        
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)