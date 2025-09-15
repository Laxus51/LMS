from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
from enum import Enum

class QuizDifficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    certification = Column(String(20), nullable=False)  # SC-100, SC-200, etc.
    topic = Column(String(255), nullable=False)  # User-entered topic
    difficulty = Column(SQLEnum(QuizDifficulty), nullable=False)
    
    # Store the complete quiz data as JSON
    quiz_content = Column(JSON, nullable=False)
    
    # User's answers and score (if completed)
    user_answers = Column(JSON, nullable=True)  # Array of selected answer indices
    score = Column(Float, nullable=True)  # Score as percentage (0-100)
    completed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="quizzes")
    
    def __repr__(self):
        return f"<Quiz(id={self.id}, certification='{self.certification}', topic='{self.topic}', difficulty='{self.difficulty}')>"