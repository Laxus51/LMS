from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from utils.auth import get_current_user
from schemas.quiz import (
    QuizRequest, QuizResponse, QuizSubmission, QuizResultResponse,
    QuizListResponse, Quiz as QuizSchema
)
from services.quiz_service import QuizService
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/quiz", tags=["quiz"])

@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(
    quiz_request: QuizRequest,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Generate a new quiz based on certification, topic, and difficulty
    """
    try:
        logger.info(f"User {current_user['id']} requesting quiz generation: {quiz_request.certification} - {quiz_request.topic} ({quiz_request.difficulty})")
        
        # Generate the quiz
        quiz = QuizService.generate_quiz(db, current_user["id"], quiz_request)
        
        return QuizResponse(
            quiz=quiz,
            message="Quiz generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error generating quiz for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/submit", response_model=QuizResultResponse)
async def submit_quiz(
    quiz_submission: QuizSubmission,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Submit quiz answers and get results
    """
    try:
        logger.info(f"User {current_user['id']} submitting quiz {quiz_submission.quiz_id}")
        
        # Submit the quiz
        quiz = QuizService.submit_quiz(db, current_user["id"], quiz_submission)
        
        # Calculate result metrics
        total_questions = len(quiz.quiz_content["questions"])
        correct_answers = sum(1 for answer in quiz.user_answers if answer["is_correct"])
        
        # Convert user_answers to UserAnswer objects for response
        from schemas.quiz import UserAnswer
        user_answers = [
            UserAnswer(
                question_id=answer["question_id"],
                selected_option=answer["selected_option"],
                is_correct=answer["is_correct"]
            )
            for answer in quiz.user_answers
        ]
        
        return QuizResultResponse(
            quiz_id=quiz.id,
            score=quiz.score,
            total_questions=total_questions,
            correct_answers=correct_answers,
            answers=user_answers,
            message="Quiz submitted successfully"
        )
        
    except Exception as e:
        logger.error(f"Error submitting quiz for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )



@router.get("/", response_model=QuizListResponse)
async def get_user_quizzes(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get all quizzes for the current user with pagination
    """
    try:
        quizzes = QuizService.get_user_quizzes(db, current_user["id"], skip, limit)
        total = QuizService.get_quiz_count(db, current_user["id"])
        
        return QuizListResponse(
            quizzes=quizzes,
            total=total,
            message="Quizzes retrieved successfully"
        )
        
    except Exception as e:
        logger.error(f"Error retrieving quizzes for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve quizzes"
        )

@router.get("/access-status")
async def get_quiz_access_status(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get user's quiz access status and remaining quota
    """
    try:
        access_status = QuizService.check_quiz_access(db, current_user["id"])
        
        return {
            "has_access": access_status["has_access"],
            "remaining_quizzes": access_status["remaining_quizzes"],
            "role": access_status["role"],
            "message": access_status["message"]
        }
        
    except Exception as e:
        logger.error(f"Error retrieving quiz access status for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve quiz access status"
        )

@router.get("/{quiz_id}", response_model=QuizSchema)
async def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get a specific quiz by ID
    """
    try:
        quiz = QuizService.get_quiz(db, current_user["id"], quiz_id)
        
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found"
            )
        
        return quiz
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving quiz {quiz_id} for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve quiz"
        )

@router.get("/{quiz_id}/review")
async def get_quiz_review(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get detailed quiz review with questions, answers, and explanations
    """
    try:
        quiz = QuizService.get_quiz(db, current_user["id"], quiz_id)
        
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found"
            )
        
        if not quiz.completed_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quiz not completed yet"
            )
        
        # Build detailed review data
        questions_with_answers = []
        for question in quiz.quiz_content["questions"]:
            # Find user's answer for this question
            user_answer = next(
                (ans for ans in quiz.user_answers if ans["question_id"] == question["question_id"]),
                None
            )
            
            question_review = {
                "question_id": question["question_id"],
                "question_text": question["question"],
                "options": question["options"],
                "correct_answer": question["correct_answer"],
                "explanation": question["explanation"],
                "user_answer": user_answer["selected_option"] if user_answer else None,
                "is_correct": user_answer["is_correct"] if user_answer else False
            }
            questions_with_answers.append(question_review)
        
        return {
            "quiz_id": quiz.id,
            "certification": quiz.certification,
            "topic": quiz.topic,
            "difficulty": quiz.difficulty,
            "score": quiz.score,
            "total_questions": len(quiz.quiz_content["questions"]),
            "correct_answers": sum(1 for ans in quiz.user_answers if ans["is_correct"]),
            "completed_at": quiz.completed_at,
            "questions": questions_with_answers
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving quiz review {quiz_id} for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve quiz review"
        )


@router.delete("/{quiz_id}")
async def delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Delete a specific quiz
    """
    try:
        success = QuizService.delete_quiz(db, current_user["id"], quiz_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found"
            )
        
        return {"message": "Quiz deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting quiz {quiz_id} for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete quiz"
        )

@router.get("/statistics/summary")
async def get_quiz_statistics(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get quiz statistics for the current user
    """
    try:
        stats = QuizService.get_quiz_statistics(db, current_user["id"])
        
        return {
            "statistics": stats,
            "message": "Quiz statistics retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"Error retrieving quiz statistics for user {current_user['id']}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve quiz statistics"
        )