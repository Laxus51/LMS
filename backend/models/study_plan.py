from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .user import Base

class StudyPlan(Base):
    __tablename__ = "study_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    certification = Column(String(10), nullable=False)  # SC-100, SC-200, SC-300, SC-400, SC-900
    certification_name = Column(String(255), nullable=False)
    duration_days = Column(Integer, nullable=False)  # 7, 30, 60, or 90
    daily_hours = Column(Float, nullable=False)  # Hours user can study daily
    plan_content = Column(JSON, nullable=False)  # Study plan content
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="study_plans")
    progress_records = relationship("StudyPlanProgress", back_populates="study_plan")
    
    def __repr__(self):
        return f"<StudyPlan(id={self.id}, user_id={self.user_id}, certification={self.certification}, duration={self.duration_days} days)>"