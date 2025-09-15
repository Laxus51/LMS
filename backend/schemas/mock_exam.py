from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class MockExamDifficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class MockExamStatus(str, Enum):
    PASS = "pass"
    FAIL = "fail"

class MockExamOption(BaseModel):
    option_id: str = Field(..., description="Option identifier (A, B, C, D)")
    text: str = Field(..., description="Option text")

class MockExamQuestion(BaseModel):
    question_id: int = Field(..., description="Question number (1-20)")
    question: str = Field(..., description="The question text")
    options: List[MockExamOption] = Field(..., description="List of 4 options")
    correct_answer: str = Field(..., description="Correct option ID (A, B, C, D)")
    explanation: str = Field(..., description="Explanation for the correct answer")

class MockExamContent(BaseModel):
    questions: List[MockExamQuestion] = Field(..., description="List of 20 mock exam questions")

class MockExamRequest(BaseModel):
    certification: str = Field(..., description="Selected certification exam")
    # Difficulty is fixed at certification level (intermediate) for all mock exams

class MockExamUserAnswer(BaseModel):
    question_id: int = Field(..., description="Question number")
    selected_option: str = Field(..., description="User's selected option (A, B, C, D)")
    is_correct: bool = Field(..., description="Whether the answer is correct")

class MockExamSubmission(BaseModel):
    mock_exam_id: int = Field(..., description="Mock Exam ID")
    answers: List[MockExamUserAnswer] = Field(..., description="User's answers")

class MockExamBase(BaseModel):
    certification: str
    difficulty: MockExamDifficulty
    exam_content: MockExamContent

class MockExamCreate(MockExamBase):
    pass

class MockExam(MockExamBase):
    id: int
    user_id: int
    user_answers: Optional[List[MockExamUserAnswer]] = None
    score: Optional[float] = None
    status: Optional[MockExamStatus] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MockExamResponse(BaseModel):
    mock_exam: MockExam
    message: str = "Mock exam generated successfully"

class MockExamResultResponse(BaseModel):
    mock_exam_id: int
    score: float
    status: MockExamStatus
    total_questions: int
    correct_answers: int
    passing_score: float = 70.0
    answers: List[MockExamUserAnswer]
    message: str = "Mock exam submitted successfully"

class MockExamListResponse(BaseModel):
    mock_exams: List[MockExam]
    total: int
    message: str = "Mock exams retrieved successfully"

class MockExamAccessResponse(BaseModel):
    has_access: bool
    message: str
    user_role: str