from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from core.database import get_db
from utils.auth import get_current_user
from models.user import UserRole
from services.study_plan_service import StudyPlanService
from schemas.study_plan import (
    StudyPlanRequest,
    StudyPlanResponse,
    CertificationsResponse,
    CertificationInfo,
    AllowedDurationsResponse,
    StudyPlanListResponse
)

router = APIRouter(prefix="/study-plans", tags=["study-plans"])

@router.get("/certifications", response_model=CertificationsResponse)
async def get_certifications():
    """Get all available Microsoft security certifications"""
    certifications_data = StudyPlanService.get_available_certifications()
    
    certifications = {}
    for code, data in certifications_data.items():
        certifications[code] = CertificationInfo(
            code=code,
            name=data["name"],
            topics=data["topics"],
            difficulty=data["difficulty"],
            estimated_hours=data["estimated_hours"]
        )
    
    return CertificationsResponse(certifications=certifications)

@router.get("/allowed-durations", response_model=AllowedDurationsResponse)
async def get_allowed_durations(current_user: Dict = Depends(get_current_user)):
    """Get allowed study plan durations based on user role"""
    durations = StudyPlanService.get_allowed_durations(current_user["role"])
    
    if current_user["role"] == UserRole.FREE:
        message = "Free users can create 7-day study plans. Upgrade to Premium for longer plans!"
    else:
        message = "Premium users can create 30, 60, or 90-day study plans."
    
    return AllowedDurationsResponse(
        durations=durations,
        user_role=current_user["role"].value,
        message=message
    )

@router.post("/generate", response_model=StudyPlanResponse)
async def generate_study_plan(
    request: StudyPlanRequest,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a new study plan"""
    # Check if user role allows the requested duration
    allowed_durations = StudyPlanService.get_allowed_durations(current_user["role"])
    
    if request.duration_days not in allowed_durations:
        if current_user["role"] == UserRole.FREE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Free users can only create 7-day study plans. Upgrade to Premium for longer plans."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid duration. Allowed durations: {allowed_durations}"
            )
    
    # Validate certification
    if request.certification not in StudyPlanService.get_available_certifications():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid certification code"
        )
    
    try:
        study_plan = StudyPlanService.create_study_plan(
            db=db,
            user_id=current_user["id"],
            certification=request.certification,
            duration_days=request.duration_days,
            daily_hours=request.daily_hours
        )
        return study_plan
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate study plan"
        )

@router.get("/", response_model=StudyPlanListResponse)
async def get_user_study_plans(
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all study plans for the current user"""
    study_plans = StudyPlanService.get_user_study_plans(db, current_user["id"])
    
    return StudyPlanListResponse(
        study_plans=study_plans,
        total=len(study_plans)
    )

@router.get("/{plan_id}", response_model=StudyPlanResponse)
async def get_study_plan(
    plan_id: int,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific study plan"""
    study_plan = StudyPlanService.get_study_plan(db, plan_id, current_user["id"])
    
    if not study_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found"
        )
    
    return study_plan

@router.delete("/{plan_id}")
async def delete_study_plan(
    plan_id: int,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a study plan"""
    success = StudyPlanService.delete_study_plan(db, plan_id, current_user["id"])
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found"
        )
    
    return {"message": "Study plan deleted successfully"}

@router.post("/preview", response_model=dict)
async def preview_study_plan(
    request: StudyPlanRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Preview a study plan without saving it"""
    # Check if user role allows the requested duration
    allowed_durations = StudyPlanService.get_allowed_durations(current_user["role"])
    
    if request.duration_days not in allowed_durations:
        if current_user["role"] == UserRole.FREE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Free users can only create 7-day study plans. Upgrade to Premium for longer plans."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid duration. Allowed durations: {allowed_durations}"
            )
    
    # Validate certification
    if request.certification not in StudyPlanService.get_available_certifications():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid certification code"
        )
    
    try:
        plan_content = StudyPlanService.generate_study_plan(
            certification=request.certification,
            duration_days=request.duration_days,
            daily_hours=request.daily_hours
        )
        return plan_content
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate study plan preview: {str(e)}"
        )