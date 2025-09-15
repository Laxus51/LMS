from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Enum
from sqlalchemy.orm import relationship
from core.database import Base
import enum
from datetime import datetime

class SessionStatus(enum.Enum):
    PENDING = "PENDING"  # Payment pending
    CONFIRMED = "CONFIRMED"  # Payment completed
    CANCELLED = "CANCELLED"  # Cancelled by user or mentor
    COMPLETED = "COMPLETED"  # Session finished
    NO_SHOW = "NO_SHOW"  # User didn't attend

class MentorAvailability(Base):
    __tablename__ = "mentor_availability"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(String, nullable=False)  # Format: "09:00"
    end_time = Column(String, nullable=False)  # Format: "17:00"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    mentor = relationship("User", back_populates="mentor_availability")

class MentorSession(Base):
    __tablename__ = "mentor_sessions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Session details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    price = Column(Float, nullable=False)  # Price in USD
    
    # Payment details
    stripe_payment_intent_id = Column(String, nullable=True)
    stripe_session_id = Column(String, nullable=True)  # Checkout session ID
    payment_status = Column(String, default="pending")  # pending, paid, failed, refunded
    
    # Session status
    status = Column(Enum(SessionStatus), default=SessionStatus.PENDING)
    
    # Session links and notes
    meeting_link = Column(String, nullable=True)  # Zoom/Google Meet link
    mentor_notes = Column(Text, nullable=True)
    student_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="mentor_sessions")
    student = relationship("User", foreign_keys=[student_id], back_populates="student_sessions")

class MentorProfile(Base):
    __tablename__ = "mentor_profiles"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Profile information
    bio = Column(Text, nullable=True)
    expertise_areas = Column(Text, nullable=True)  # JSON string of areas
    hourly_rate = Column(Float, nullable=False)  # USD per hour
    years_experience = Column(Integer, nullable=True)
    
    # Settings
    is_accepting_sessions = Column(Boolean, default=True)
    min_session_duration = Column(Integer, default=30)  # minutes
    max_session_duration = Column(Integer, default=120)  # minutes
    
    # Statistics
    total_sessions = Column(Integer, default=0)
    average_rating = Column(Float, default=0.0)
    total_earnings = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="mentor_profile")

class SessionReview(Base):
    __tablename__ = "session_reviews"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("mentor_sessions.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    rating = Column(Integer, nullable=False)  # 1-5 stars
    comment = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("MentorSession")
    reviewer = relationship("User")
