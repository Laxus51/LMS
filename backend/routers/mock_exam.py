from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from utils.auth import get_current_user
from schemas.mock_exam import (
    MockExamRequest, MockExamResponse, MockExamSubmission, MockExamResultResponse,
    MockExamListResponse, MockExam as MockExamSchema, MockExamAccessResponse
)
from services.mock_exam_service import MockExamService
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mock-exam", tags=["mock-exam"])

@router.get("/access-status", response_model=MockExamAccessResponse)
async def get_mock_exam_access_status(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Check if user has access to mock exams (premium only)
    """
    try:
        access_info = MockExamService.check_mock_exam_access(db, current_user["id"])
        
        return MockExamAccessResponse(
            has_access=access_info["has_access"],
            message=access_info["message"],
            user_role=access_info["user_role"]
        )
        
    except Exception as e:
        logger.error(f"Error checking mock exam access for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check access status"
        )

@router.post("/generate", response_model=MockExamResponse)
async def generate_mock_exam(
    mock_exam_request: MockExamRequest,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Generate a new mock exam with 20 questions (premium users only)
    """
    try:
        logger.info(f"User {current_user['id']} requesting mock exam generation: {mock_exam_request.certification} (certification level)")
        
        # Generate the mock exam
        mock_exam = MockExamService.generate_mock_exam(db, current_user["id"], mock_exam_request)
        
        return MockExamResponse(
            mock_exam=mock_exam,
            message="Mock exam generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error generating mock exam for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/submit", response_model=MockExamResultResponse)
async def submit_mock_exam(
    mock_exam_submission: MockExamSubmission,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Submit mock exam answers and get results with pass/fail status
    """
    try:
        logger.info(f"User {current_user['id']} submitting mock exam {mock_exam_submission.mock_exam_id}")
        
        # Submit the mock exam
        mock_exam = MockExamService.submit_mock_exam(db, current_user["id"], mock_exam_submission)
        
        # Calculate result metrics
        total_questions = len(mock_exam.exam_content["questions"])
        correct_answers = sum(1 for answer in mock_exam.user_answers if answer["is_correct"])
        
        # Convert user_answers to MockExamUserAnswer objects for response
        from schemas.mock_exam import MockExamUserAnswer
        user_answers = [
            MockExamUserAnswer(
                question_id=answer["question_id"],
                selected_option=answer["selected_option"],
                is_correct=answer["is_correct"]
            )
            for answer in mock_exam.user_answers
        ]
        
        return MockExamResultResponse(
            mock_exam_id=mock_exam.id,
            score=mock_exam.score,
            status=mock_exam.status,
            total_questions=total_questions,
            correct_answers=correct_answers,
            passing_score=70.0,
            answers=user_answers,
            message="Mock exam submitted successfully"
        )
        
    except Exception as e:
        logger.error(f"Error submitting mock exam for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/", response_model=MockExamListResponse)
async def get_user_mock_exams(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get all mock exams for the current user with pagination
    """
    try:
        # Check access first
        access_info = MockExamService.check_mock_exam_access(db, current_user["id"])
        if not access_info["has_access"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=access_info["message"]
            )
        
        mock_exams = MockExamService.get_user_mock_exams(db, current_user["id"], skip, limit)
        total_count = MockExamService.get_mock_exam_count(db, current_user["id"])
        
        return MockExamListResponse(
            mock_exams=mock_exams,
            total=total_count,
            message="Mock exams retrieved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving mock exams for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve mock exams"
        )

@router.get("/{mock_exam_id}", response_model=MockExamSchema)
async def get_mock_exam(
    mock_exam_id: int,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get a specific mock exam by ID
    """
    try:
        # Check access first
        access_info = MockExamService.check_mock_exam_access(db, current_user["id"])
        if not access_info["has_access"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=access_info["message"]
            )
        
        mock_exam = MockExamService.get_mock_exam(db, current_user["id"], mock_exam_id)
        
        if not mock_exam:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mock exam not found"
            )
        
        return mock_exam
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving mock exam {mock_exam_id} for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve mock exam"
        )

@router.get("/{mock_exam_id}/review")
async def get_mock_exam_review(
    mock_exam_id: int,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get detailed review of a completed mock exam with correct answers and explanations
    """
    try:
        # Check access first
        access_info = MockExamService.check_mock_exam_access(db, current_user["id"])
        if not access_info["has_access"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=access_info["message"]
            )
        
        mock_exam = MockExamService.get_mock_exam(db, current_user["id"], mock_exam_id)
        
        if not mock_exam:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mock exam not found"
            )
        
        if not mock_exam.completed_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mock exam not yet completed"
            )
        
        # Prepare detailed review with questions, user answers, and explanations
        questions_with_answers = []
        for question in mock_exam.exam_content["questions"]:
            user_answer = next(
                (ans for ans in mock_exam.user_answers if ans["question_id"] == question["question_id"]),
                None
            )
            
            questions_with_answers.append({
                "question_id": question["question_id"],
                "question": question["question"],
                "options": question["options"],
                "correct_answer": question["correct_answer"],
                "explanation": question["explanation"],
                "user_answer": user_answer["selected_option"] if user_answer else None,
                "is_correct": user_answer["is_correct"] if user_answer else False
            })
        
        total_questions = len(mock_exam.exam_content["questions"])
        correct_answers = sum(1 for answer in mock_exam.user_answers if answer["is_correct"])
        
        return {
            "mock_exam_id": mock_exam.id,
            "certification": mock_exam.certification,
            "difficulty": mock_exam.difficulty,
            "score": mock_exam.score,
            "status": mock_exam.status,
            "total_questions": total_questions,
            "correct_answers": correct_answers,
            "passing_score": 70.0,
            "completed_at": mock_exam.completed_at,
            "questions_with_answers": questions_with_answers,
            "message": "Mock exam review retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving mock exam review {mock_exam_id} for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve mock exam review"
        )

@router.delete("/{mock_exam_id}")
async def delete_mock_exam(
    mock_exam_id: int,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Delete a mock exam
    """
    try:
        # Check access first
        access_info = MockExamService.check_mock_exam_access(db, current_user["id"])
        if not access_info["has_access"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=access_info["message"]
            )
        
        success = MockExamService.delete_mock_exam(db, current_user["id"], mock_exam_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mock exam not found"
            )
        
        return {
            "message": "Mock exam deleted successfully",
            "mock_exam_id": mock_exam_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting mock exam {mock_exam_id} for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete mock exam"
        )

@router.get("/statistics/summary")
async def get_mock_exam_statistics(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get mock exam statistics for the current user
    """
    try:
        # Check access first
        access_info = MockExamService.check_mock_exam_access(db, current_user["id"])
        if not access_info["has_access"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=access_info["message"]
            )
        
        statistics = MockExamService.get_mock_exam_statistics(db, current_user["id"])
        
        return {
            "statistics": statistics,
            "message": "Mock exam statistics retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving mock exam statistics for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve mock exam statistics"
        )