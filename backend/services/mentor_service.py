from sqlalchemy.orm import Session
from sqlalchemy import func
from models.mentor_session import MentorSession, MentorAvailability, MentorProfile, SessionReview, SessionStatus
from models.user import User, UserRole
from schemas.mentor_session import (
    MentorProfileCreate, MentorProfileUpdate,
    MentorAvailabilityCreate, MentorAvailabilityUpdate,
    MentorSessionCreate, SessionBookingRequest,
    SessionReviewCreate, MentorListItem
)
from datetime import datetime, timedelta, time
from typing import List, Optional, Dict, Any
import logging
from services.stripe_service import StripeService

logger = logging.getLogger(__name__)

class MentorService:
    def __init__(self):
        self.stripe_service = StripeService()
    
    # Mentor Profile Management
    def create_mentor_profile(self, db: Session, user_id: int, profile_data: MentorProfileCreate) -> MentorProfile:
        """Create a mentor profile for a user"""
        # Check if user exists and has mentor role
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        if user.role != UserRole.MENTOR:
            raise ValueError("User must have mentor role")
        
        # Check if profile already exists
        existing_profile = db.query(MentorProfile).filter(MentorProfile.user_id == user_id).first()
        if existing_profile:
            raise ValueError("Mentor profile already exists")
        
        mentor_profile = MentorProfile(
            user_id=user_id,
            **profile_data.dict()
        )
        
        db.add(mentor_profile)
        db.commit()
        db.refresh(mentor_profile)
        
        logger.info(f"Created mentor profile for user {user_id}")
        return mentor_profile
    
    def get_mentor_profile(self, db: Session, user_id: int) -> Optional[MentorProfile]:
        """Get mentor profile by user ID"""
        return db.query(MentorProfile).filter(MentorProfile.user_id == user_id).first()
    
    def update_mentor_profile(self, db: Session, user_id: int, profile_data: MentorProfileUpdate) -> Optional[MentorProfile]:
        """Update mentor profile"""
        mentor_profile = db.query(MentorProfile).filter(MentorProfile.user_id == user_id).first()
        if not mentor_profile:
            return None
        
        update_data = profile_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(mentor_profile, field, value)
        
        mentor_profile.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(mentor_profile)
        
        return mentor_profile
    
    # Mentor Availability Management
    def create_availability(self, db: Session, mentor_id: int, availability_data: MentorAvailabilityCreate) -> MentorAvailability:
        """Create availability slot for mentor"""
        # Validate mentor exists
        mentor = db.query(User).filter(User.id == mentor_id, User.role == UserRole.MENTOR).first()
        if not mentor:
            raise ValueError("Mentor not found")
        
        availability = MentorAvailability(
            mentor_id=mentor_id,
            **availability_data.dict()
        )
        
        db.add(availability)
        db.commit()
        db.refresh(availability)
        
        return availability
    
    def get_mentor_availability(self, db: Session, mentor_id: int) -> List[MentorAvailability]:
        """Get all availability slots for a mentor"""
        return db.query(MentorAvailability).filter(
            MentorAvailability.mentor_id == mentor_id,
            MentorAvailability.is_active == True
        ).all()
    
    def update_availability(self, db: Session, availability_id: int, mentor_id: int, availability_data: MentorAvailabilityUpdate) -> Optional[MentorAvailability]:
        """Update availability slot"""
        availability = db.query(MentorAvailability).filter(
            MentorAvailability.id == availability_id,
            MentorAvailability.mentor_id == mentor_id
        ).first()
        
        if not availability:
            return None
        
        update_data = availability_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(availability, field, value)
        
        db.commit()
        db.refresh(availability)
        
        return availability
    
    def delete_availability(self, db: Session, availability_id: int, mentor_id: int) -> bool:
        """Delete availability slot"""
        availability = db.query(MentorAvailability).filter(
            MentorAvailability.id == availability_id,
            MentorAvailability.mentor_id == mentor_id
        ).first()
        
        if not availability:
            return False
        
        db.delete(availability)
        db.commit()
        return True
    
    # Session Booking
    def book_session(self, db: Session, student_id: int, booking_data: SessionBookingRequest) -> MentorSession:
        """Book a mentor session"""
        # Validate mentor exists and is accepting sessions
        mentor_profile = db.query(MentorProfile).filter(
            MentorProfile.user_id == booking_data.mentor_id,
            MentorProfile.is_accepting_sessions == True
        ).first()
        
        if not mentor_profile:
            raise ValueError("Mentor not found or not accepting sessions")
        
        # Check if time slot is available
        if not self._is_time_slot_available(db, booking_data.mentor_id, booking_data.scheduled_at, booking_data.duration_minutes):
            raise ValueError("Time slot is not available")
        
        # Calculate price
        price = self._calculate_session_price(mentor_profile.hourly_rate, booking_data.duration_minutes)
        
        # Create session
        session = MentorSession(
            mentor_id=booking_data.mentor_id,
            student_id=student_id,
            title=booking_data.title,
            description=booking_data.description,
            scheduled_at=booking_data.scheduled_at,
            duration_minutes=booking_data.duration_minutes,
            price=price,
            status='PENDING'
        )
        
        db.add(session)
        db.commit()
        db.refresh(session)
        
        logger.info(f"Session booked: {session.id} for student {student_id} with mentor {booking_data.mentor_id}")
        return session
    
    def _is_time_slot_available(self, db: Session, mentor_id: int, scheduled_at: datetime, duration_minutes: int) -> bool:
        """Check if a time slot is available for booking"""
        # Check if mentor has availability for this day/time
        day_of_week = scheduled_at.weekday()  # 0=Monday
        session_time = scheduled_at.time()
        
        availability = db.query(MentorAvailability).filter(
            MentorAvailability.mentor_id == mentor_id,
            MentorAvailability.day_of_week == day_of_week,
            MentorAvailability.is_active == True
        ).first()
        
        if not availability:
            return False
        
        # Parse time strings and check if session fits within availability
        start_time = datetime.strptime(availability.start_time, "%H:%M").time()
        end_time = datetime.strptime(availability.end_time, "%H:%M").time()
        session_end_time = (scheduled_at + timedelta(minutes=duration_minutes)).time()
        
        if session_time < start_time or session_end_time > end_time:
            return False
        
        # Check for conflicting sessions
        session_end = scheduled_at + timedelta(minutes=duration_minutes)
        
        # Get all potentially conflicting sessions and check manually
        potential_conflicts = db.query(MentorSession).filter(
            MentorSession.mentor_id == mentor_id,
            MentorSession.status.in_(['CONFIRMED', 'PENDING'])
        ).all()
        
        conflicting_sessions = 0
        for existing_session in potential_conflicts:
            existing_end = existing_session.scheduled_at + timedelta(minutes=existing_session.duration_minutes)
            # Check if sessions overlap
            if (scheduled_at < existing_end and session_end > existing_session.scheduled_at):
                conflicting_sessions += 1
        
        return conflicting_sessions == 0
    
    def _calculate_session_price(self, hourly_rate: float, duration_minutes: int) -> float:
        """Calculate session price based on hourly rate and duration"""
        hours = duration_minutes / 60.0
        return round(hourly_rate * hours, 2)
    
    # Session Management
    def get_session(self, db: Session, session_id: int) -> Optional[MentorSession]:
        """Get session by ID"""
        from sqlalchemy.orm import joinedload
        
        return db.query(MentorSession).options(
            joinedload(MentorSession.mentor),
            joinedload(MentorSession.student)
        ).filter(MentorSession.id == session_id).first()
    
    def get_mentor_sessions(self, db: Session, mentor_id: int, status: Optional[SessionStatus] = None) -> List[MentorSession]:
        """Get sessions for a mentor"""
        from sqlalchemy.orm import joinedload
        from models.user import User
        
        query = db.query(MentorSession).options(
            joinedload(MentorSession.mentor),
            joinedload(MentorSession.student)
        ).filter(MentorSession.mentor_id == mentor_id)
        
        if status:
            query = query.filter(MentorSession.status == status)
        
        return query.order_by(MentorSession.scheduled_at.desc()).all()
    
    def get_student_sessions(self, db: Session, student_id: int, status: Optional[SessionStatus] = None) -> List[MentorSession]:
        """Get sessions for a student"""
        from sqlalchemy.orm import joinedload
        
        query = db.query(MentorSession).options(
            joinedload(MentorSession.mentor),
            joinedload(MentorSession.student)
        ).filter(MentorSession.student_id == student_id)
        
        if status:
            query = query.filter(MentorSession.status == status)
        
        return query.order_by(MentorSession.scheduled_at.desc()).all()
    
    def update_session_status(self, db: Session, session_id: int, status: SessionStatus, user_id: int) -> Optional[MentorSession]:
        """Update session status (only by mentor or admin)"""
        session = db.query(MentorSession).filter(MentorSession.id == session_id).first()
        if not session:
            return None
        
        # Check permissions
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        if user.role != UserRole.ADMIN and session.mentor_id != user_id:
            raise ValueError("Insufficient permissions")
        
        session.status = status
        session.updated_at = datetime.utcnow()
        
        # Update mentor profile stats if session is completed
        # Note: Earnings are updated when payment is confirmed, not when completed
        if status.value == 'COMPLETED':
            # Only update rating and other completion-specific stats here
            # Earnings are already updated when status changed to CONFIRMED
            pass
        
        db.commit()
        db.refresh(session)
        
        return session
    
    # Mentor Discovery
    def get_available_mentors(self, db: Session, expertise_area: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get list of available mentors"""
        query = db.query(User, MentorProfile).join(MentorProfile).filter(
            User.role == UserRole.MENTOR,
            MentorProfile.is_accepting_sessions == True
        )
        
        if expertise_area:
            query = query.filter(MentorProfile.expertise_areas.contains(expertise_area))
        
        results = query.all()
        
        mentors = []
        for user, profile in results:
            mentors.append({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "bio": profile.bio,
                "expertise_areas": profile.expertise_areas,
                "hourly_rate": profile.hourly_rate,
                "years_experience": profile.years_experience,
                "average_rating": profile.average_rating,
                "total_sessions": profile.total_sessions,
                "is_accepting_sessions": profile.is_accepting_sessions
            })
        
        return mentors
    
    # Payment Integration
    def create_session_payment(self, db: Session, session_id: int, success_url: str, cancel_url: str) -> Dict[str, str]:
        """Create Stripe checkout session for mentor session payment"""
        session = db.query(MentorSession).filter(MentorSession.id == session_id).first()
        if not session:
            raise ValueError("Session not found")
        
        if session.payment_status == "paid":
            raise ValueError("Session already paid")
        
        student = db.query(User).filter(User.id == session.student_id).first()
        if not student:
            raise ValueError("Student not found")
        
        # Create Stripe checkout session for one-time payment
        try:
            stripe_session = self.stripe_service.create_session_payment(
                amount=int(session.price * 100),  # Convert to cents
                currency="usd",
                description=f"Mentor Session: {session.title}",
                student_email=student.email,
                session_id=session.id,
                success_url=success_url,
                cancel_url=cancel_url
            )
            
            # Update session with Stripe session ID
            session.stripe_session_id = stripe_session['session_id']
            db.commit()
            
            return stripe_session
        except Exception as e:
            logger.error(f"Error creating session payment: {e}")
            raise Exception(f"Failed to create payment session: {str(e)}")
    
    def confirm_session_payment(self, db: Session, session_id: int, payment_intent_id: str) -> bool:
        """Confirm session payment and update status"""
        session = db.query(MentorSession).filter(MentorSession.id == session_id).first()
        if not session:
            return False
        
        # Only update if not already confirmed
        if session.status != 'CONFIRMED':
            session.payment_status = "paid"
            session.stripe_payment_intent_id = payment_intent_id
            session.status = 'CONFIRMED'
            session.updated_at = datetime.utcnow()
            
            # Update mentor earnings when payment is confirmed
            self._update_mentor_earnings(db, session.mentor_id, session.price)
        
        db.commit()
        
        logger.info(f"Session payment confirmed: {session_id}")
        return True
    
    def get_session_by_id(self, db: Session, session_id: int) -> MentorSession:
        """Get session by ID"""
        from sqlalchemy.orm import joinedload
        
        session = db.query(MentorSession).options(
            joinedload(MentorSession.mentor),
            joinedload(MentorSession.student)
        ).filter(MentorSession.id == session_id).first()
        if not session:
            raise ValueError("Session not found")
        return session
    
    def verify_and_update_payment(self, db: Session, session_id: int, user_id: int) -> Dict[str, Any]:
        """Verify payment with Stripe and update session status"""
        session = db.query(MentorSession).filter(MentorSession.id == session_id).first()
        if not session:
            raise ValueError("Session not found")
        
        # Check if user is authorized (student or mentor)
        if user_id not in [session.student_id, session.mentor_id]:
            raise ValueError("Not authorized to verify this session")
        
        # If already confirmed, return current status
        if session.status == 'CONFIRMED':
            return {
                "status": "already_confirmed",
                "session": session
            }
        
        # Check Stripe payment status
        if session.stripe_session_id:
            try:
                # Get payment status from Stripe
                stripe_session = self.stripe_service.get_checkout_session(session.stripe_session_id)
                
                if stripe_session and stripe_session.payment_status == 'paid':
                    # Update session status
                    session.payment_status = "paid"
                    session.stripe_payment_intent_id = stripe_session.payment_intent
                    session.status = 'CONFIRMED'
                    session.updated_at = datetime.utcnow()
                    
                    # Update mentor earnings when payment is verified
                    self._update_mentor_earnings(db, session.mentor_id, session.price)
                    
                    db.commit()
                    db.refresh(session)
                    
                    logger.info(f"Session payment verified and confirmed: {session_id}")
                    return {
                        "status": "confirmed",
                        "session": session
                    }
                else:
                    return {
                        "status": "payment_pending",
                        "session": session
                    }
                    
            except Exception as e:
                logger.error(f"Error verifying payment for session {session_id}: {e}")
                return {
                    "status": "verification_failed",
                    "session": session
                }
        
        return {
            "status": "no_payment_session",
            "session": session
        }
    
    # Reviews
    def create_review(self, db: Session, session_id: int, reviewer_id: int, review_data: SessionReviewCreate) -> SessionReview:
        """Create a review for a completed session"""
        session = db.query(MentorSession).filter(MentorSession.id == session_id).first()
        if not session:
            raise ValueError("Session not found")
        
        if session.status != 'COMPLETED':
            raise ValueError("Can only review completed sessions")
        
        # Check if reviewer is student or mentor in the session
        if reviewer_id not in [session.student_id, session.mentor_id]:
            raise ValueError("Only session participants can leave reviews")
        
        # Check if review already exists
        existing_review = db.query(SessionReview).filter(
            SessionReview.session_id == session_id,
            SessionReview.reviewer_id == reviewer_id
        ).first()
        
        if existing_review:
            raise ValueError("Review already exists")
        
        review = SessionReview(
            session_id=session_id,
            reviewer_id=reviewer_id,
            **review_data.dict()
        )
        
        db.add(review)
        
        # Update mentor's average rating
        if reviewer_id == session.student_id:  # Student reviewing mentor
            self._update_mentor_rating(db, session.mentor_id)
        
        db.commit()
        db.refresh(review)
        
        return review
    
    def _update_mentor_rating(self, db: Session, mentor_id: int):
        """Update mentor's average rating based on all reviews"""
        # Get all reviews for this mentor's sessions
        reviews = db.query(SessionReview).join(MentorSession).filter(
            MentorSession.mentor_id == mentor_id,
            SessionReview.reviewer_id == MentorSession.student_id  # Only student reviews
        ).all()
        
        if reviews:
            average_rating = sum(review.rating for review in reviews) / len(reviews)
            mentor_profile = db.query(MentorProfile).filter(MentorProfile.user_id == mentor_id).first()
            if mentor_profile:
                mentor_profile.average_rating = round(average_rating, 2)
    
    def _update_mentor_earnings(self, db: Session, mentor_id: int, session_price: float):
        """Update mentor's total earnings and session count"""
        mentor_profile = db.query(MentorProfile).filter(MentorProfile.user_id == mentor_id).first()
        if mentor_profile:
            mentor_profile.total_sessions += 1
            mentor_profile.total_earnings += session_price
            logger.info(f"Updated mentor {mentor_id} earnings: +${session_price} (total: ${mentor_profile.total_earnings})")
    
    # Dashboard Stats
    def get_mentor_stats(self, db: Session, mentor_id: int) -> Dict[str, Any]:
        """Get dashboard stats for mentor"""
        total_sessions = db.query(MentorSession).filter(MentorSession.mentor_id == mentor_id).count()
        
        upcoming_sessions = db.query(MentorSession).filter(
            MentorSession.mentor_id == mentor_id,
            MentorSession.status == 'CONFIRMED',
            MentorSession.scheduled_at > datetime.utcnow()
        ).count()
        
        completed_sessions = db.query(MentorSession).filter(
            MentorSession.mentor_id == mentor_id,
            MentorSession.status == 'COMPLETED'
        ).count()
        
        pending_sessions = db.query(MentorSession).filter(
            MentorSession.mentor_id == mentor_id,
            MentorSession.status == 'PENDING'
        ).count()
        
        mentor_profile = db.query(MentorProfile).filter(MentorProfile.user_id == mentor_id).first()
        total_earnings = mentor_profile.total_earnings if mentor_profile else 0.0
        average_rating = mentor_profile.average_rating if mentor_profile else 0.0
        
        return {
            "total_sessions": total_sessions,
            "upcoming_sessions": upcoming_sessions,
            "completed_sessions": completed_sessions,
            "pending_sessions": pending_sessions,
            "total_earnings": total_earnings,
            "average_rating": average_rating
        }
    
    def get_student_stats(self, db: Session, student_id: int) -> Dict[str, Any]:
        """Get dashboard stats for student"""
        total_sessions = db.query(MentorSession).filter(MentorSession.student_id == student_id).count()
        
        upcoming_sessions = db.query(MentorSession).filter(
            MentorSession.student_id == student_id,
            MentorSession.status == 'CONFIRMED',
            MentorSession.scheduled_at > datetime.utcnow()
        ).count()
        
        completed_sessions = db.query(MentorSession).filter(
            MentorSession.student_id == student_id,
            MentorSession.status == 'COMPLETED'
        ).count()
        
        total_spent = db.query(MentorSession).filter(
            MentorSession.student_id == student_id,
            MentorSession.payment_status == "paid"
        ).with_entities(func.sum(MentorSession.price)).scalar() or 0.0
        
        return {
            "total_sessions": total_sessions,
            "upcoming_sessions": upcoming_sessions,
            "completed_sessions": completed_sessions,
            "total_spent": total_spent
        }
