from sqlalchemy.orm import Session
from models.mock_exam import MockExam, MockExamStatus
from models.user import User, UserRole
from schemas.mock_exam import (
    MockExamRequest, MockExamSubmission, MockExamUserAnswer, 
    MockExamContent
)
from services.openai_service import OpenAIService
from typing import List, Optional
import logging
from datetime import datetime
import json
import time

logger = logging.getLogger(__name__)

class MockExamService:
    @staticmethod
    def check_mock_exam_access(db: Session, user_id: int) -> dict:
        """
        Check if user has access to mock exam generation
        Only premium users and admins can access mock exams
        Returns: {"has_access": bool, "message": str, "user_role": str}
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"has_access": False, "message": "User not found", "user_role": "unknown"}
        
        # Only Premium and Admin users can access mock exams
        if user.role in [UserRole.ADMIN, UserRole.PREMIUM]:
            return {
                "has_access": True, 
                "message": "Access granted to mock exams", 
                "user_role": user.role.value
            }
        
        # Free users and mentors cannot access mock exams
        return {
            "has_access": False, 
            "message": "Mock exams are only available for Premium users. Please upgrade your account.", 
            "user_role": user.role.value
        }
    
    @staticmethod
    def generate_mock_exam_content(certification: str, difficulty: str = "intermediate") -> dict:
        """
        Generate 20 MCQ questions for mock exam using OpenAI
        Mock exams are always at certification level (intermediate difficulty)
        """
        try:
            openai_service = OpenAIService()
            
            # Optimized system message for faster generation
            system_message = f"""Generate exactly 20 multiple-choice questions for {certification} certification exam. Return ONLY valid JSON without markdown or code blocks.

JSON format:
{{
    "questions": [
        {{
            "question_id": 1,
            "question": "Question text?",
            "options": [
                {{"option_id": "A", "text": "Option A"}},
                {{"option_id": "B", "text": "Option B"}},
                {{"option_id": "C", "text": "Option C"}},
                {{"option_id": "D", "text": "Option D"}}
            ],
            "correct_answer": "A",
            "explanation": "Brief explanation"
        }}
    ]
}}

Requirements: 20 questions, 4 options each, certification-level difficulty, brief explanations."""
            
            user_message = f"Generate 20 MCQ questions for {certification} certification exam."
            
            logger.info(f"Generating mock exam for {certification} - Certification level")
            
            response = openai_service.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=6000,  # Optimized for 20 questions with brief explanations
                temperature=0.1
            )
            
            response_content = response.choices[0].message.content.strip()
            
            # Parse the JSON response
            try:
                # Clean up response by removing markdown formatting
                cleaned_response = response_content.strip()
                if cleaned_response.startswith("```json"):
                    cleaned_response = cleaned_response.replace("```json", "").replace("```", "").strip()
                elif cleaned_response.startswith("```"):
                    cleaned_response = cleaned_response.replace("```", "").strip()
                
                # Extract JSON content
                if not cleaned_response.startswith('{'):
                    start_idx = cleaned_response.find('{')
                    if start_idx != -1:
                        cleaned_response = cleaned_response[start_idx:]
                
                if not cleaned_response.endswith('}'):
                    end_idx = cleaned_response.rfind('}')
                    if end_idx != -1:
                        cleaned_response = cleaned_response[:end_idx + 1]
                
                # Parse JSON
                mock_exam_data = json.loads(cleaned_response)
                
                # Basic validation
                if "questions" not in mock_exam_data or len(mock_exam_data["questions"]) != 20:
                    raise ValueError("Invalid mock exam structure: must contain exactly 20 questions")
                
                # Quick validation of essential fields
                for question in mock_exam_data["questions"]:
                    if not all(field in question for field in ["question", "options", "correct_answer"]):
                        raise ValueError("Question missing required fields")
                    if len(question["options"]) != 4:
                        raise ValueError("Question must have exactly 4 options")
                
                return mock_exam_data
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse AI response as JSON: {e}")
                raise Exception("AI generated invalid JSON response")
            except ValueError as e:
                logger.error(f"Mock exam validation failed: {e}")
                raise Exception(f"Invalid mock exam format: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error generating mock exam: {str(e)}")
            raise Exception(f"Failed to generate mock exam: {str(e)}")
    
    @staticmethod
    def generate_mock_exam(db: Session, user_id: int, mock_exam_request: MockExamRequest) -> MockExam:
        """
        Generate a new mock exam and save it to the database with premium access control
        """
        try:
            # Check access first
            access_info = MockExamService.check_mock_exam_access(db, user_id)
            if not access_info["has_access"]:
                raise Exception(access_info["message"])
            
            # Get user for verification
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise Exception("User not found")
            
            logger.info(f"Generating mock exam for user {user_id}: {mock_exam_request.certification} (certification level)")
            
            # Generate mock exam content using OpenAI (always certification level)
            exam_data = MockExamService.generate_mock_exam_content(
                certification=mock_exam_request.certification,
                difficulty="intermediate"  # Fixed certification level
            )
            
            # Create mock exam content object
            exam_content = MockExamContent(**exam_data)
            
            # Create mock exam in database (always intermediate difficulty for certification level)
            from schemas.mock_exam import MockExamDifficulty
            db_mock_exam = MockExam(
                user_id=user_id,
                certification=mock_exam_request.certification,
                difficulty=MockExamDifficulty.INTERMEDIATE,  # Fixed certification level
                exam_content=exam_content.dict(),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.add(db_mock_exam)
            db.commit()
            db.refresh(db_mock_exam)
            
            logger.info(f"Mock exam generated successfully with ID: {db_mock_exam.id}")
            return db_mock_exam
            
        except Exception as e:
            logger.error(f"Error generating mock exam: {str(e)}")
            db.rollback()
            raise Exception(f"Failed to generate mock exam: {str(e)}")
    
    @staticmethod
    def submit_mock_exam(db: Session, user_id: int, mock_exam_submission: MockExamSubmission) -> MockExam:
        """
        Submit mock exam answers, calculate score, and determine pass/fail status
        """
        try:
            # Get the mock exam
            mock_exam = db.query(MockExam).filter(
                MockExam.id == mock_exam_submission.mock_exam_id,
                MockExam.user_id == user_id
            ).first()
            
            if not mock_exam:
                raise Exception("Mock exam not found or access denied")
            
            if mock_exam.completed_at:
                raise Exception("Mock exam already completed")
            
            # Calculate score (each question worth 1 mark, total 20 marks)
            total_questions = len(mock_exam.exam_content["questions"])
            correct_answers = 0
            
            # Process each answer
            processed_answers = []
            for answer in mock_exam_submission.answers:
                # Find the corresponding question
                question = next(
                    (q for q in mock_exam.exam_content["questions"] if q["question_id"] == answer.question_id),
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
            
            # Determine pass/fail status (70% threshold)
            status = MockExamStatus.PASS if score >= 70.0 else MockExamStatus.FAIL
            
            # Update mock exam with answers, score, and status
            mock_exam.user_answers = processed_answers
            mock_exam.score = score
            mock_exam.status = status
            mock_exam.completed_at = datetime.utcnow()
            mock_exam.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(mock_exam)
            
            logger.info(f"Mock exam {mock_exam.id} submitted successfully. Score: {score:.1f}% ({correct_answers}/{total_questions}) - Status: {status.value}")
            return mock_exam
            
        except Exception as e:
            logger.error(f"Error submitting mock exam: {str(e)}")
            db.rollback()
            raise Exception(f"Failed to submit mock exam: {str(e)}")
    
    @staticmethod
    def get_mock_exam(db: Session, user_id: int, mock_exam_id: int) -> Optional[MockExam]:
        """
        Get a specific mock exam for a user
        """
        return db.query(MockExam).filter(
            MockExam.id == mock_exam_id,
            MockExam.user_id == user_id
        ).first()
    
    @staticmethod
    def get_user_mock_exams(db: Session, user_id: int, skip: int = 0, limit: int = 20) -> List[MockExam]:
        """
        Get all mock exams for a user with pagination
        """
        return db.query(MockExam).filter(
            MockExam.user_id == user_id
        ).order_by(MockExam.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_mock_exam_count(db: Session, user_id: int) -> int:
        """
        Get total count of mock exams for a user
        """
        return db.query(MockExam).filter(MockExam.user_id == user_id).count()
    
    @staticmethod
    def delete_mock_exam(db: Session, user_id: int, mock_exam_id: int) -> bool:
        """
        Delete a mock exam for a user
        """
        try:
            mock_exam = db.query(MockExam).filter(
                MockExam.id == mock_exam_id,
                MockExam.user_id == user_id
            ).first()
            
            if not mock_exam:
                return False
            
            db.delete(mock_exam)
            db.commit()
            
            logger.info(f"Mock exam {mock_exam_id} deleted successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting mock exam: {str(e)}")
            db.rollback()
            return False
    
    @staticmethod
    def get_mock_exam_statistics(db: Session, user_id: int) -> dict:
        """
        Get mock exam statistics for a user
        """
        try:
            mock_exams = db.query(MockExam).filter(
                MockExam.user_id == user_id,
                MockExam.completed_at.isnot(None)
            ).all()
            
            if not mock_exams:
                return {
                    "total_exams": 0,
                    "passed_exams": 0,
                    "failed_exams": 0,
                    "pass_rate": 0.0,
                    "average_score": 0.0,
                    "highest_score": 0.0,
                    "latest_score": 0.0
                }
            
            total_exams = len(mock_exams)
            passed_exams = len([exam for exam in mock_exams if exam.status == MockExamStatus.PASS])
            failed_exams = total_exams - passed_exams
            pass_rate = (passed_exams / total_exams) * 100 if total_exams > 0 else 0.0
            
            scores = [exam.score for exam in mock_exams if exam.score is not None]
            average_score = sum(scores) / len(scores) if scores else 0.0
            highest_score = max(scores) if scores else 0.0
            latest_score = mock_exams[0].score if mock_exams and mock_exams[0].score else 0.0
            
            return {
                "total_exams": total_exams,
                "passed_exams": passed_exams,
                "failed_exams": failed_exams,
                "pass_rate": round(pass_rate, 1),
                "average_score": round(average_score, 1),
                "highest_score": round(highest_score, 1),
                "latest_score": round(latest_score, 1)
            }
            
        except Exception as e:
            logger.error(f"Error getting mock exam statistics: {str(e)}")
            raise Exception(f"Failed to get mock exam statistics: {str(e)}")