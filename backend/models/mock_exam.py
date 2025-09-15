from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Enum as SQLEnum, Float, Boolean
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
from enum import Enum

class MockExamDifficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class MockExamStatus(str, Enum):
    PASS = "pass"
    FAIL = "fail"

class MockExam(Base):
    __tablename__ = "mock_exams"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    certification = Column(String(20), nullable=False)  # SC-100, SC-200, etc.
    difficulty = Column(SQLEnum(MockExamDifficulty, values_callable=lambda x: [e.value for e in x]), nullable=False)
    
    # Store the complete mock exam data as JSON (20 questions)
    exam_content = Column(JSON, nullable=False)
    
    # User's answers and score (if completed)
    user_answers = Column(JSON, nullable=True)  # Array of selected answer indices
    score = Column(Float, nullable=True)  # Score as percentage (0-100)
    status = Column(SQLEnum(MockExamStatus, values_callable=lambda x: [e.value for e in x]), nullable=True)  # PASS or FAIL
    completed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="mock_exams")
    
    def __repr__(self):
        return f"<MockExam(id={self.id}, certification='{self.certification}', level='certification', status='{self.status}')>"