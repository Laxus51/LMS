from sqlalchemy.orm import Session
from models.study_plan_progress import StudyPlanProgress
from models.study_plan import StudyPlan
from models.user import User
from fastapi import HTTPException
from typing import List, Optional
from datetime import datetime

class StudyPlanProgressService:
    
    @classmethod
    def toggle_day_completion(cls, db: Session, user_id: int, study_plan_id: int, day_number: int) -> StudyPlanProgress:
        """Toggle completion status of a specific day in a study plan"""
        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify study plan exists and belongs to user
        study_plan = db.query(StudyPlan).filter(
            StudyPlan.id == study_plan_id,
            StudyPlan.user_id == user_id
        ).first()
        if not study_plan:
            raise HTTPException(status_code=404, detail="Study plan not found")
        
        # Validate day number
        if day_number < 1 or day_number > study_plan.duration_days:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid day number. Must be between 1 and {study_plan.duration_days}"
            )
        
        try:
            # Check if progress record exists
            progress = db.query(StudyPlanProgress).filter(
                StudyPlanProgress.user_id == user_id,
                StudyPlanProgress.study_plan_id == study_plan_id,
                StudyPlanProgress.day_number == day_number
            ).first()
            
            if progress:
                # Toggle completion status
                progress.is_completed = not progress.is_completed
                progress.completed_at = datetime.utcnow() if progress.is_completed else None
                progress.updated_at = datetime.utcnow()
            else:
                # Create new progress record as completed
                progress = StudyPlanProgress(
                    user_id=user_id,
                    study_plan_id=study_plan_id,
                    day_number=day_number,
                    is_completed=True,
                    completed_at=datetime.utcnow()
                )
                db.add(progress)
            
            db.commit()
            db.refresh(progress)
            return progress
            
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to update progress: {str(e)}")
    
    @classmethod
    def get_study_plan_progress(cls, db: Session, user_id: int, study_plan_id: int) -> List[StudyPlanProgress]:
        """Get all progress records for a specific study plan"""
        # Verify study plan exists and belongs to user
        study_plan = db.query(StudyPlan).filter(
            StudyPlan.id == study_plan_id,
            StudyPlan.user_id == user_id
        ).first()
        if not study_plan:
            raise HTTPException(status_code=404, detail="Study plan not found")
        
        return db.query(StudyPlanProgress).filter(
            StudyPlanProgress.user_id == user_id,
            StudyPlanProgress.study_plan_id == study_plan_id
        ).order_by(StudyPlanProgress.day_number).all()
    
    @classmethod
    def get_progress_summary(cls, db: Session, user_id: int, study_plan_id: int) -> dict:
        """Get progress summary for a study plan"""
        # Get study plan
        study_plan = db.query(StudyPlan).filter(
            StudyPlan.id == study_plan_id,
            StudyPlan.user_id == user_id
        ).first()
        if not study_plan:
            raise HTTPException(status_code=404, detail="Study plan not found")
        
        # Get completed days
        completed_records = db.query(StudyPlanProgress).filter(
            StudyPlanProgress.user_id == user_id,
            StudyPlanProgress.study_plan_id == study_plan_id,
            StudyPlanProgress.is_completed == True
        ).all()
        
        completed_days = len(completed_records)
        total_days = study_plan.duration_days
        progress_percentage = round((completed_days / total_days) * 100, 1) if total_days > 0 else 0
        completed_day_numbers = [record.day_number for record in completed_records]
        
        return {
            "study_plan_id": study_plan_id,
            "total_days": total_days,
            "completed_days": completed_days,
            "progress_percentage": progress_percentage,
            "completed_day_numbers": sorted(completed_day_numbers)
        }
    
    @classmethod
    def mark_day_completed(cls, db: Session, user_id: int, study_plan_id: int, day_number: int) -> StudyPlanProgress:
        """Mark a specific day as completed"""
        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify study plan exists and belongs to user
        study_plan = db.query(StudyPlan).filter(
            StudyPlan.id == study_plan_id,
            StudyPlan.user_id == user_id
        ).first()
        if not study_plan:
            raise HTTPException(status_code=404, detail="Study plan not found")
        
        # Validate day number
        if day_number < 1 or day_number > study_plan.duration_days:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid day number. Must be between 1 and {study_plan.duration_days}"
            )
        
        try:
            # Check if progress record exists
            progress = db.query(StudyPlanProgress).filter(
                StudyPlanProgress.user_id == user_id,
                StudyPlanProgress.study_plan_id == study_plan_id,
                StudyPlanProgress.day_number == day_number
            ).first()
            
            if progress:
                # Update existing record
                progress.is_completed = True
                progress.completed_at = datetime.utcnow()
                progress.updated_at = datetime.utcnow()
            else:
                # Create new progress record
                progress = StudyPlanProgress(
                    user_id=user_id,
                    study_plan_id=study_plan_id,
                    day_number=day_number,
                    is_completed=True,
                    completed_at=datetime.utcnow()
                )
                db.add(progress)
            
            db.commit()
            db.refresh(progress)
            return progress
            
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to mark day as completed: {str(e)}")
    
    @classmethod
    def mark_day_incomplete(cls, db: Session, user_id: int, study_plan_id: int, day_number: int) -> StudyPlanProgress:
        """Mark a specific day as incomplete"""
        # Verify study plan exists and belongs to user
        study_plan = db.query(StudyPlan).filter(
            StudyPlan.id == study_plan_id,
            StudyPlan.user_id == user_id
        ).first()
        if not study_plan:
            raise HTTPException(status_code=404, detail="Study plan not found")
        
        # Validate day number
        if day_number < 1 or day_number > study_plan.duration_days:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid day number. Must be between 1 and {study_plan.duration_days}"
            )
        
        try:
            # Find existing progress record
            progress = db.query(StudyPlanProgress).filter(
                StudyPlanProgress.user_id == user_id,
                StudyPlanProgress.study_plan_id == study_plan_id,
                StudyPlanProgress.day_number == day_number
            ).first()
            
            if progress:
                # Update existing record
                progress.is_completed = False
                progress.completed_at = None
                progress.updated_at = datetime.utcnow()
                db.commit()
                db.refresh(progress)
                return progress
            else:
                # Create new progress record as incomplete
                progress = StudyPlanProgress(
                    user_id=user_id,
                    study_plan_id=study_plan_id,
                    day_number=day_number,
                    is_completed=False,
                    completed_at=None
                )
                db.add(progress)
                db.commit()
                db.refresh(progress)
                return progress
            
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to mark day as incomplete: {str(e)}")