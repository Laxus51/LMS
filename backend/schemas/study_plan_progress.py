from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class StudyPlanProgressCreate(BaseModel):
    study_plan_id: int = Field(..., description="ID of the study plan")
    day_number: int = Field(..., ge=1, description="Day number to mark as completed")
    is_completed: bool = Field(True, description="Whether the day is completed")

class StudyPlanProgressUpdate(BaseModel):
    is_completed: bool = Field(..., description="Whether the day is completed")

class StudyPlanProgressResponse(BaseModel):
    id: int
    user_id: int
    study_plan_id: int
    day_number: int
    is_completed: bool
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class StudyPlanProgressListResponse(BaseModel):
    progress_records: List[StudyPlanProgressResponse]
    total_days: int
    completed_days: int
    progress_percentage: float

class StudyPlanProgressSummary(BaseModel):
    study_plan_id: int
    total_days: int
    completed_days: int
    progress_percentage: float
    completed_day_numbers: List[int]