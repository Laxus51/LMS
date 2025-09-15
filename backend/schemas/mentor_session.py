from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models.mentor_session import SessionStatus

# Mentor Profile Schemas
class MentorProfileBase(BaseModel):
    bio: Optional[str] = None
    expertise_areas: Optional[str] = None
    hourly_rate: float = Field(..., gt=0)
    years_experience: Optional[int] = Field(None, ge=0)
    is_accepting_sessions: bool = True
    min_session_duration: int = Field(30, ge=15, le=240)
    max_session_duration: int = Field(120, ge=30, le=480)

class MentorProfileCreate(MentorProfileBase):
    pass

class MentorProfileUpdate(BaseModel):
    bio: Optional[str] = None
    expertise_areas: Optional[str] = None
    hourly_rate: Optional[float] = Field(None, gt=0)
    years_experience: Optional[int] = Field(None, ge=0)
    is_accepting_sessions: Optional[bool] = None
    min_session_duration: Optional[int] = Field(None, ge=15, le=240)
    max_session_duration: Optional[int] = Field(None, ge=30, le=480)

class MentorProfileResponse(MentorProfileBase):
    id: int
    user_id: int
    total_sessions: int
    average_rating: float
    total_earnings: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Mentor Availability Schemas
class MentorAvailabilityBase(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6)  # 0=Monday, 6=Sunday
    start_time: str = Field(..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: str = Field(..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    is_active: bool = True

class MentorAvailabilityCreate(MentorAvailabilityBase):
    pass

class MentorAvailabilityUpdate(BaseModel):
    start_time: Optional[str] = Field(None, pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: Optional[str] = Field(None, pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    is_active: Optional[bool] = None

class MentorAvailabilityResponse(MentorAvailabilityBase):
    id: int
    mentor_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Session Schemas
class MentorSessionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    scheduled_at: datetime
    duration_minutes: int = Field(60, ge=15, le=480)

class MentorSessionCreate(MentorSessionBase):
    mentor_id: int

class MentorSessionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=15, le=480)
    meeting_link: Optional[str] = None
    mentor_notes: Optional[str] = None

class MentorSessionResponse(MentorSessionBase):
    id: int
    mentor_id: int
    student_id: int
    price: float
    status: SessionStatus
    payment_status: str
    meeting_link: Optional[str] = None
    mentor_notes: Optional[str] = None
    student_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    # Nested objects
    mentor_name: Optional[str] = None
    student_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# Payment Schemas
class SessionPaymentRequest(BaseModel):
    session_id: int
    success_url: str
    cancel_url: str

class SessionPaymentResponse(BaseModel):
    session_id: str
    session_url: str

# Booking Schemas
class SessionBookingRequest(BaseModel):
    mentor_id: int
    scheduled_at: datetime
    duration_minutes: int = Field(60, ge=15, le=480)
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None

class SessionBookingResponse(BaseModel):
    session: MentorSessionResponse
    payment_required: bool
    payment_url: Optional[str] = None

# Available Time Slots
class TimeSlot(BaseModel):
    start_time: datetime
    end_time: datetime
    available: bool

class AvailableTimeSlotsRequest(BaseModel):
    mentor_id: int
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")  # YYYY-MM-DD format

class AvailableTimeSlotsResponse(BaseModel):
    date: str
    slots: List[TimeSlot]

# Mentor List Schema
class MentorListItem(BaseModel):
    id: int
    name: str
    email: str
    bio: Optional[str] = None
    expertise_areas: Optional[str] = None
    hourly_rate: float
    years_experience: Optional[int] = None
    average_rating: float
    total_sessions: int
    is_accepting_sessions: bool
    
    class Config:
        from_attributes = True

class MentorListResponse(BaseModel):
    mentors: List[MentorListItem]
    total: int

# Session Review Schemas
class SessionReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class SessionReviewResponse(BaseModel):
    id: int
    session_id: int
    reviewer_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    reviewer_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# Dashboard Schemas
class MentorDashboardStats(BaseModel):
    total_sessions: int
    upcoming_sessions: int
    completed_sessions: int
    total_earnings: float
    average_rating: float
    pending_sessions: int

class StudentDashboardStats(BaseModel):
    total_sessions: int
    upcoming_sessions: int
    completed_sessions: int
    total_spent: float
