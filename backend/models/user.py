from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
from sqlalchemy.orm import relationship
from core.database import Base
import enum
from datetime import datetime

class UserRole(enum.Enum):
    FREE = "free"
    PREMIUM = "premium"
    MENTOR = "mentor"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.FREE)
    name = Column(String, nullable=True)
    auth_method = Column(String, nullable=False, default="email")  # "email" or "google"
    has_password = Column(Boolean, nullable=False, default=True)  # False for OAuth users who haven't set a password
    
    # Subscription fields
    subscription_id = Column(String, nullable=True)  # Stripe subscription ID
    subscription_status = Column(String, nullable=True)  # active, canceled, past_due, etc.
    subscription_end_date = Column(DateTime, nullable=True)  # When subscription ends
    
    # Relationships
    study_plans = relationship("StudyPlan", back_populates="user")
    study_plan_progress = relationship("StudyPlanProgress", back_populates="user")
    quizzes = relationship("Quiz", back_populates="user")
    mock_exams = relationship("MockExam", back_populates="user")
    
    # Mentor session relationships
    mentor_sessions = relationship("MentorSession", foreign_keys="MentorSession.mentor_id", back_populates="mentor")
    student_sessions = relationship("MentorSession", foreign_keys="MentorSession.student_id", back_populates="student")
    mentor_availability = relationship("MentorAvailability", back_populates="mentor")
    mentor_profile = relationship("MentorProfile", back_populates="user", uselist=False)