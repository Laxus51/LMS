from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .user import Base

class StudyPlanProgress(Base):
    __tablename__ = "study_plan_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    study_plan_id = Column(Integer, ForeignKey("study_plans.id"), nullable=False)
    day_number = Column(Integer, nullable=False)  # Day 1, 2, 3, etc.
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime, nullable=True)  # When the day was marked as completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="study_plan_progress")
    study_plan = relationship("StudyPlan", back_populates="progress_records")
    
    def __repr__(self):
        return f"<StudyPlanProgress(id={self.id}, user_id={self.user_id}, study_plan_id={self.study_plan_id}, day={self.day_number}, completed={self.is_completed})>"
    
    class Config:
        from_attributes = True