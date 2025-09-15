from sqlalchemy.orm import Session
from models.quiz import Quiz
from models.user import User, UserRole
from models.daily_usage import DailyUsage
from schemas.quiz import QuizRequest, QuizCreate, QuizSubmission, UserAnswer, QuizContent
from services.openai_service import generate_ai_quiz
from typing import List, Optional
import logging
from datetime import datetime, date
import json

logger = logging.getLogger(__name__)

class QuizService:
    @staticmethod
    def check_quiz_access(db: Session, user_id: int) -> dict:
        """
        Check if user has access to quiz generation and return access info
        Returns: {"has_access": bool, "remaining_quizzes": int, "role": str, "message": str}
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"has_access": False, "remaining_quizzes": 0, "role": "unknown", "message": "User not found"}
        
        # Mentor role cannot access quizzes
        if user.role == UserRole.MENTOR:
            return {"has_access": False, "remaining_quizzes": 0, "role": "mentor", "message": "Quiz feature not available for mentors"}
        
        # Admin and Premium have unlimited access
        if user.role in [UserRole.ADMIN, UserRole.PREMIUM]:
            return {"has_access": True, "remaining_quizzes": -1, "role": user.role.value, "message": "Unlimited access"}
        
        # Free users have daily limit of 3 quizzes
        if user.role == UserRole.FREE:
            today = date.today()
            daily_usage = db.query(DailyUsage).filter(
                DailyUsage.user_id == user_id,
                DailyUsage.date == today
            ).first()
            
            quizzes_used = daily_usage.quiz_count if daily_usage else 0
            remaining = max(0, 3 - quizzes_used)
            
            if remaining > 0:
                return {"has_access": True, "remaining_quizzes": remaining, "role": "free", "message": f"{remaining} quiz{'es' if remaining != 1 else ''} remaining today"}
            else:
                return {"has_access": False, "remaining_quizzes": 0, "role": "free", "message": "Daily limit reached (3/3 quizzes used). Upgrade to Premium for unlimited access"}
        
        return {"has_access": False, "remaining_quizzes": 0, "role": user.role.value, "message": "Unknown role"}
    
    @staticmethod
    def increment_daily_quiz_usage(db: Session, user_id: int):
        """
        Increment the daily quiz count for a user
        """
        try:
            today = date.today()
            daily_usage = db.query(DailyUsage).filter(
                DailyUsage.user_id == user_id,
                DailyUsage.date == today
            ).first()
            
            if daily_usage:
                daily_usage.quiz_count += 1
            else:
                daily_usage = DailyUsage(
                    user_id=user_id,
                    date=today,
                    quiz_count=1,
                    chat_messages_count=0
                )
                db.add(daily_usage)
            
            db.commit()
            logger.info(f"Incremented daily quiz usage for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error incrementing daily quiz usage: {str(e)}")
            db.rollback()
            raise Exception(f"Failed to update daily usage: {str(e)}")
    
    @staticmethod
    def generate_quiz(db: Session, user_id: int, quiz_request: QuizRequest) -> Quiz:
        """
        Generate a new quiz using OpenAI and save it to the database with access control
        """
        try:
            # Check access first
            access_info = QuizService.check_quiz_access(db, user_id)
            if not access_info["has_access"]:
                raise Exception(access_info["message"])
            
            # Get user for role checking
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise Exception("User not found")
            
            logger.info(f"Generating quiz for user {user_id}: {quiz_request.certification} - {quiz_request.topic} ({quiz_request.difficulty})")
            
            # Generate quiz content using OpenAI
            quiz_data = generate_ai_quiz(
                certification=quiz_request.certification,
                topic=quiz_request.topic,
                difficulty=quiz_request.difficulty.value
            )
            
            # Create quiz content object
            quiz_content = QuizContent(**quiz_data)
            
            # Create quiz in database
            db_quiz = Quiz(
                user_id=user_id,
                certification=quiz_request.certification,
                topic=quiz_request.topic,
                difficulty=quiz_request.difficulty,
                quiz_content=quiz_content.dict(),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.add(db_quiz)
            db.commit()
            db.refresh(db_quiz)
            
            # Increment daily usage for free users
            if user.role == UserRole.FREE:
                QuizService.increment_daily_quiz_usage(db, user_id)
            
            logger.info(f"Quiz generated successfully with ID: {db_quiz.id}")
            return db_quiz
            
        except Exception as e:
            logger.error(f"Error generating quiz: {str(e)}")
            db.rollback()
            raise Exception(f"Failed to generate quiz: {str(e)}")
    
    @staticmethod
    def submit_quiz(db: Session, user_id: int, quiz_submission: QuizSubmission) -> Quiz:
        """
        Submit quiz answers and calculate score
        """
        try:
            # Get the quiz
            quiz = db.query(Quiz).filter(
                Quiz.id == quiz_submission.quiz_id,
                Quiz.user_id == user_id
            ).first()
            
            if not quiz:
                raise Exception("Quiz not found or access denied")
            
            if quiz.completed_at:
                raise Exception("Quiz already completed")
            
            # Calculate score
            total_questions = len(quiz.quiz_content["questions"])
            correct_answers = 0
            
            # Process each answer
            processed_answers = []
            for answer in quiz_submission.answers:
                # Find the corresponding question
                question = next(
                    (q for q in quiz.quiz_content["questions"] if q["question_id"] == answer.question_id),
                    None
                )
                
                if question:
                    is_correct = answer.selected_option == question["correct_answer"]
                    if is_correct:
                        correct_answers += 1
                    
                    processed_answers.append({
                        "question_id": answer.question_id,
                        "selected_option": answer.selected_option,
                        "is_correct": is_correct
                    })
            
            # Calculate percentage score
            score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
            
            # Update quiz with answers and score
            quiz.user_answers = processed_answers
            quiz.score = score
            quiz.completed_at = datetime.utcnow()
            quiz.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(quiz)
            
            logger.info(f"Quiz {quiz.id} submitted successfully. Score: {score:.1f}% ({correct_answers}/{total_questions})")
            return quiz
            
        except Exception as e:
            logger.error(f"Error submitting quiz: {str(e)}")
            db.rollback()
            raise Exception(f"Failed to submit quiz: {str(e)}")
    
    @staticmethod
    def get_quiz(db: Session, user_id: int, quiz_id: int) -> Optional[Quiz]:
        """
        Get a specific quiz for a user
        """
        return db.query(Quiz).filter(
            Quiz.id == quiz_id,
            Quiz.user_id == user_id
        ).first()
    
    @staticmethod
    def get_user_quizzes(db: Session, user_id: int, skip: int = 0, limit: int = 20) -> List[Quiz]:
        """
        Get all quizzes for a user with pagination
        """
        return db.query(Quiz).filter(
            Quiz.user_id == user_id
        ).order_by(Quiz.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_quiz_count(db: Session, user_id: int) -> int:
        """
        Get total count of quizzes for a user
        """
        return db.query(Quiz).filter(Quiz.user_id == user_id).count()
    
    @staticmethod
    def delete_quiz(db: Session, user_id: int, quiz_id: int) -> bool:
        """
        Delete a quiz for a user
        """
        try:
            quiz = db.query(Quiz).filter(
                Quiz.id == quiz_id,
                Quiz.user_id == user_id
            ).first()
            
            if not quiz:
                return False
            
            db.delete(quiz)
            db.commit()
            
            logger.info(f"Quiz {quiz_id} deleted successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting quiz: {str(e)}")
            db.rollback()
            raise Exception(f"Failed to delete quiz: {str(e)}")
    
    @staticmethod
    def get_quiz_statistics(db: Session, user_id: int) -> dict:
        """
        Get quiz statistics for a user
        """
        try:
            quizzes = db.query(Quiz).filter(
                Quiz.user_id == user_id,
                Quiz.completed_at.isnot(None)
            ).all()
            
            if not quizzes:
                return {
                    "total_quizzes": 0,
                    "average_score": 0,
                    "highest_score": 0,
                    "lowest_score": 0,
                    "completion_rate": 0
                }
            
            scores = [quiz.score for quiz in quizzes if quiz.score is not None]
            total_created = db.query(Quiz).filter(Quiz.user_id == user_id).count()
            
            return {
                "total_quizzes": len(quizzes),
                "average_score": sum(scores) / len(scores) if scores else 0,
                "highest_score": max(scores) if scores else 0,
                "lowest_score": min(scores) if scores else 0,
                "completion_rate": (len(quizzes) / total_created * 100) if total_created > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Error getting quiz statistics: {str(e)}")
            raise Exception(f"Failed to get quiz statistics: {str(e)}")