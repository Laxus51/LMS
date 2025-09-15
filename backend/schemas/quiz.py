from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class QuizDifficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class QuizOption(BaseModel):
    option_id: str = Field(..., description="Option identifier (A, B, C, D)")
    text: str = Field(..., description="Option text")

class QuizQuestion(BaseModel):
    question_id: int = Field(..., description="Question number (1-5)")
    question: str = Field(..., description="The question text")
    options: List[QuizOption] = Field(..., description="List of 4 options")
    correct_answer: str = Field(..., description="Correct option ID (A, B, C, D)")
    explanation: str = Field(..., description="Explanation for the correct answer")

class QuizContent(BaseModel):
    questions: List[QuizQuestion] = Field(..., description="List of 5 quiz questions")

class QuizRequest(BaseModel):
    certification: str = Field(..., description="Selected certification exam")
    topic: str = Field(..., description="Topic for the quiz")
    difficulty: QuizDifficulty = Field(..., description="Quiz difficulty level")

class UserAnswer(BaseModel):
    question_id: int = Field(..., description="Question number")
    selected_option: str = Field(..., description="User's selected option (A, B, C, D)")
    is_correct: bool = Field(..., description="Whether the answer is correct")

class QuizSubmission(BaseModel):
    quiz_id: int = Field(..., description="Quiz ID")
    answers: List[UserAnswer] = Field(..., description="User's answers")

class QuizBase(BaseModel):
    certification: str
    topic: str
    difficulty: QuizDifficulty
    quiz_content: QuizContent

class QuizCreate(QuizBase):
    pass

class Quiz(QuizBase):
    id: int
    user_id: int
    user_answers: Optional[List[UserAnswer]] = None
    score: Optional[float] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class QuizResponse(BaseModel):
    quiz: Quiz
    message: str = "Quiz generated successfully"

class QuizResultResponse(BaseModel):
    quiz_id: int
    score: float
    total_questions: int
    correct_answers: int
    answers: List[UserAnswer]
    message: str = "Quiz submitted successfully"

class QuizListResponse(BaseModel):
    quizzes: List[Quiz]
    total: int
    message: str = "Quizzes retrieved successfully"