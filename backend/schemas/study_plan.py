from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class StudyPlanRequest(BaseModel):
    certification: str = Field(..., description="Certification code (SC-100, SC-200, SC-300, SC-400, SC-900)")
    duration_days: int = Field(..., ge=7, le=90, description="Study plan duration in days")
    daily_hours: float = Field(..., ge=0.5, le=12, description="Daily study hours")

class ActivityItem(BaseModel):
    task: str
    time_minutes: int

class DailyPlanItem(BaseModel):
    day: int
    topic: str
    activities: List[ActivityItem]
    hours: int
    resources: List[str]

class ExamInfo(BaseModel):
    estimated_prep_time: str
    difficulty_level: str
    topics_count: int
    duration: str
    questions: str
    passing_score: str
    cost: str

class StudyPlanContent(BaseModel):
    certification: str
    certification_name: str
    duration_days: int
    daily_hours: float
    total_hours: int
    difficulty: str
    daily_plan: List[DailyPlanItem]
    tips: List[str]
    exam_info: ExamInfo



class StudyPlanResponse(BaseModel):
    id: int
    user_id: int
    certification: str
    certification_name: str
    duration_days: int
    daily_hours: float
    plan_content: StudyPlanContent
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CertificationInfo(BaseModel):
    code: str
    name: str
    topics: List[str]
    difficulty: str
    estimated_hours: int

class CertificationsResponse(BaseModel):
    certifications: Dict[str, CertificationInfo]

class AllowedDurationsResponse(BaseModel):
    durations: List[int]
    user_role: str
    message: str

class StudyPlanListResponse(BaseModel):
    study_plans: List[StudyPlanResponse]
    total: int