from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta
import json
import logging

from core.database import get_db
from utils.auth import get_current_user, require_roles
from models.user import UserRole
from models.mentor_session import SessionStatus
from schemas.mentor_session import (
    MentorProfileCreate, MentorProfileUpdate, MentorProfileResponse,
    MentorAvailabilityCreate, MentorAvailabilityUpdate, MentorAvailabilityResponse,
    MentorSessionResponse, SessionBookingRequest, SessionBookingResponse,
    SessionPaymentRequest, SessionPaymentResponse,
    AvailableTimeSlotsRequest, AvailableTimeSlotsResponse, TimeSlot,
    MentorListResponse, MentorListItem,
    SessionReviewCreate, SessionReviewResponse,
    MentorDashboardStats, StudentDashboardStats
)
from services.mentor_service import MentorService

router = APIRouter(prefix="/mentor-sessions", tags=["mentor-sessions"])
mentor_service = MentorService()
logger = logging.getLogger(__name__)

# Mentor Profile Management
@router.post("/mentor/profile", response_model=MentorProfileResponse)
async def create_mentor_profile(
    profile_data: MentorProfileCreate,
    current_user: dict = Depends(require_roles([UserRole.MENTOR])),
    db: Session = Depends(get_db)
):
    """Create mentor profile (mentor only)"""
    try:
        profile = mentor_service.create_mentor_profile(db, current_user["id"], profile_data)
        return profile
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create mentor profile")

@router.get("/mentor/profile", response_model=MentorProfileResponse)
async def get_mentor_profile(
    current_user: dict = Depends(require_roles([UserRole.MENTOR])),
    db: Session = Depends(get_db)
):
    """Get mentor's own profile"""
    profile = mentor_service.get_mentor_profile(db, current_user["id"])
    if not profile:
        raise HTTPException(status_code=404, detail="Mentor profile not found")
    return profile

@router.put("/mentor/profile", response_model=MentorProfileResponse)
async def update_mentor_profile(
    profile_data: MentorProfileUpdate,
    current_user: dict = Depends(require_roles([UserRole.MENTOR])),
    db: Session = Depends(get_db)
):
    """Update mentor profile"""
    profile = mentor_service.update_mentor_profile(db, current_user["id"], profile_data)
    if not profile:
        raise HTTPException(status_code=404, detail="Mentor profile not found")
    return profile

@router.get("/mentor/{mentor_id}/profile", response_model=MentorProfileResponse)
async def get_public_mentor_profile(
    mentor_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get public mentor profile (for students)"""
    profile = mentor_service.get_mentor_profile(db, mentor_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Mentor profile not found")
    return profile

# Mentor Availability Management
@router.post("/mentor/availability", response_model=MentorAvailabilityResponse)
async def create_availability(
    availability_data: MentorAvailabilityCreate,
    current_user: dict = Depends(require_roles([UserRole.MENTOR])),
    db: Session = Depends(get_db)
):
    """Create availability slot"""
    try:
        availability = mentor_service.create_availability(db, current_user["id"], availability_data)
        return availability
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/mentor/availability", response_model=List[MentorAvailabilityResponse])
async def get_mentor_availability(
    current_user: dict = Depends(require_roles([UserRole.MENTOR])),
    db: Session = Depends(get_db)
):
    """Get mentor's availability slots"""
    return mentor_service.get_mentor_availability(db, current_user["id"])

@router.put("/mentor/availability/{availability_id}", response_model=MentorAvailabilityResponse)
async def update_availability(
    availability_id: int,
    availability_data: MentorAvailabilityUpdate,
    current_user: dict = Depends(require_roles([UserRole.MENTOR])),
    db: Session = Depends(get_db)
):
    """Update availability slot"""
    availability = mentor_service.update_availability(db, availability_id, current_user["id"], availability_data)
    if not availability:
        raise HTTPException(status_code=404, detail="Availability slot not found")
    return availability

@router.delete("/mentor/availability/{availability_id}")
async def delete_availability(
    availability_id: int,
    current_user: dict = Depends(require_roles([UserRole.MENTOR])),
    db: Session = Depends(get_db)
):
    """Delete availability slot"""
    success = mentor_service.delete_availability(db, availability_id, current_user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Availability slot not found")
    return {"message": "Availability slot deleted successfully"}

# Mentor Discovery
@router.get("/mentors", response_model=MentorListResponse)
async def get_available_mentors(
    expertise_area: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of available mentors"""
    mentors = mentor_service.get_available_mentors(db, expertise_area)
    return MentorListResponse(mentors=mentors, total=len(mentors))

@router.get("/mentor/{mentor_id}/available-slots", response_model=AvailableTimeSlotsResponse)
async def get_available_time_slots(
    mentor_id: int,
    date: str,  # YYYY-MM-DD format
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get available time slots for a mentor on a specific date"""
    try:
        # Parse date
        requested_date = datetime.strptime(date, "%Y-%m-%d").date()
        
        # Get mentor availability for the day of week
        day_of_week = requested_date.weekday()  # 0=Monday
        availability_slots = mentor_service.get_mentor_availability(db, mentor_id)
        
        # Filter for the requested day
        day_availability = [slot for slot in availability_slots if slot.day_of_week == day_of_week]
        
        if not day_availability:
            return AvailableTimeSlotsResponse(date=date, slots=[])
        
        # Generate time slots (assuming 60-minute slots)
        slots = []
        for availability in day_availability:
            start_time = datetime.strptime(availability.start_time, "%H:%M").time()
            end_time = datetime.strptime(availability.end_time, "%H:%M").time()
            
            current_time = datetime.combine(requested_date, start_time)
            end_datetime = datetime.combine(requested_date, end_time)
            
            while current_time + timedelta(hours=1) <= end_datetime:
                slot_start = current_time
                slot_end = current_time + timedelta(hours=1)
                
                # Check if slot is available (no conflicting sessions)
                is_available = mentor_service._is_time_slot_available(
                    db, mentor_id, slot_start, 60
                )
                
                slots.append(TimeSlot(
                    start_time=slot_start,
                    end_time=slot_end,
                    available=is_available
                ))
                
                current_time += timedelta(hours=1)
        
        return AvailableTimeSlotsResponse(date=date, slots=slots)
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get available slots")

# Session Booking
@router.post("/book", response_model=SessionBookingResponse)
async def book_session(
    booking_data: SessionBookingRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Book a mentor session"""
    try:
        session = mentor_service.book_session(db, current_user["id"], booking_data)
        
        # Create payment session
        current_url = "http://localhost:5173"  # You may want to make this configurable
        success_url = f"{current_url}/mentor-sessions/payment-success?session_id={session.id}"
        cancel_url = f"{current_url}/mentor-sessions/payment-cancel?session_id={session.id}"
        
        payment_session = mentor_service.create_session_payment(
            db, session.id, success_url, cancel_url
        )
        
        return SessionBookingResponse(
            session=session,
            payment_required=True,
            payment_url=payment_session['session_url']
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to book session")

# Session Management
@router.get("/sessions", response_model=List[MentorSessionResponse])
async def get_user_sessions(
    status: Optional[SessionStatus] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's sessions (as student or mentor)"""
    if current_user["role"] == UserRole.MENTOR:
        sessions = mentor_service.get_mentor_sessions(db, current_user["id"], status)
    else:
        sessions = mentor_service.get_student_sessions(db, current_user["id"], status)
    
    
    # Add mentor/student names to response
    for session in sessions:
        if hasattr(session, 'mentor') and session.mentor:
            session.mentor_name = session.mentor.name
        if hasattr(session, 'student') and session.student:
            session.student_name = session.student.name
    
    return sessions

@router.get("/sessions/{session_id}", response_model=MentorSessionResponse)
async def get_session(
    session_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get session details"""
    session = mentor_service.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check permissions
    if session.mentor_id != current_user["id"] and session.student_id != current_user["id"]:
        if current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Add mentor/student names
    if hasattr(session, 'mentor') and session.mentor:
        session.mentor_name = session.mentor.name
    if hasattr(session, 'student') and session.student:
        session.student_name = session.student.name
    
    return session

@router.put("/sessions/{session_id}/status")
async def update_session_status(
    session_id: int,
    status: SessionStatus,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update session status (mentor or admin only)"""
    try:
        session = mentor_service.update_session_status(db, session_id, status, current_user["id"])
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"message": "Session status updated successfully", "status": status}
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.post("/session/{session_id}/verify-payment")
async def verify_session_payment(
    session_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify payment status and update session if paid"""
    try:
        result = mentor_service.verify_and_update_payment(db, session_id, current_user["id"])
        return {"success": True, "status": result["status"], "session": result["session"]}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to verify payment")

# Session Reviews
@router.post("/sessions/{session_id}/review", response_model=SessionReviewResponse)
async def create_session_review(
    session_id: int,
    review_data: SessionReviewCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a review for a session"""
    try:
        review = mentor_service.create_review(db, session_id, current_user["id"], review_data)
        
        # Add reviewer name
        if hasattr(review, 'reviewer') and review.reviewer:
            review.reviewer_name = review.reviewer.name
            
        return review
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Dashboard Stats
@router.get("/mentor/dashboard", response_model=MentorDashboardStats)
async def get_mentor_dashboard(
    current_user: dict = Depends(require_roles([UserRole.MENTOR])),
    db: Session = Depends(get_db)
):
    """Get mentor dashboard statistics"""
    stats = mentor_service.get_mentor_stats(db, current_user["id"])
    return MentorDashboardStats(**stats)

@router.get("/student/dashboard", response_model=StudentDashboardStats)
async def get_student_dashboard(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get student dashboard statistics"""
    stats = mentor_service.get_student_stats(db, current_user["id"])
    return StudentDashboardStats(**stats)

# Payment Webhook Handler (extend existing payment router)
@router.post("/payment/webhook")
async def mentor_session_webhook(
    request: dict,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhook events for mentor session payments"""
    try:
        event_type = request.get('type')
        
        if event_type == 'checkout.session.completed':
            session_data = request['data']['object']
            metadata = session_data.get('metadata', {})
            
            if metadata.get('type') == 'mentor_session':
                session_id = int(metadata.get('session_id'))
                payment_intent_id = session_data.get('payment_intent')
                
                success = mentor_service.confirm_session_payment(db, session_id, payment_intent_id)
                if success:
                    return {"status": "success"}
                else:
                    return {"status": "error", "message": "Session not found"}
        
        return {"status": "ignored"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Webhook processing failed")
