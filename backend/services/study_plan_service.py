from typing import Dict, List, Any, Generator
from sqlalchemy.orm import Session
from models.study_plan import StudyPlan
from models.user import User, UserRole
from services.openai_service import generate_ai_study_plan
from datetime import datetime, timedelta
import asyncio
import threading
import json

class StudyPlanService:
    
    # Supported Microsoft Security certifications - AI will generate detailed content
    SUPPORTED_CERTIFICATIONS = {
        "SC-100": {
            "name": "Microsoft Cybersecurity Architect",
            "topics": ["Design Zero Trust strategy", "Evaluate GRC strategies", "Design security for infrastructure", "Design data and application strategy", "Recommend security best practices"],
            "difficulty": "expert",
            "estimated_hours": 120,
            "exam_info": {
                "estimated_prep_time": "120-150 hours",
                "difficulty_level": "Expert",
                "topics_count": 5,
                "duration": "120 minutes",
                "questions": "40-60 questions",
                "passing_score": "700/1000",
                "cost": "$165 USD"
            },
            "tips": [
                "Focus on hands-on experience with Azure security services",
                "Practice designing end-to-end security architectures",
                "Study Zero Trust principles and implementation strategies",
                "Review case studies and real-world scenarios"
            ]
        },
        "SC-200": {
            "name": "Microsoft Security Operations Analyst",
            "topics": ["Mitigate threats using Microsoft 365 Defender", "Mitigate threats using Azure Defender", "Mitigate threats using Azure Sentinel", "Create KQL queries", "Configure SIEM"],
            "difficulty": "intermediate",
            "estimated_hours": 80,
            "exam_info": {
                "estimated_prep_time": "80-100 hours",
                "difficulty_level": "Intermediate",
                "topics_count": 4,
                "duration": "120 minutes",
                "questions": "40-60 questions",
                "passing_score": "700/1000",
                "cost": "$165 USD"
            },
            "tips": [
                "Practice writing KQL queries extensively",
                "Get hands-on experience with Microsoft Sentinel",
                "Focus on incident response and threat hunting scenarios",
                "Study Microsoft 365 Defender integration"
            ]
        },
        "SC-300": {
            "name": "Microsoft Identity and Access Administrator",
            "topics": ["Implement identity management", "Implement authentication and access management", "Implement access management for apps", "Plan identity governance strategy", "Monitor and troubleshoot Azure AD"],
            "difficulty": "intermediate",
            "estimated_hours": 70,
            "exam_info": {
                "estimated_prep_time": "70-90 hours",
                "difficulty_level": "Intermediate",
                "topics_count": 5,
                "duration": "120 minutes",
                "questions": "40-60 questions",
                "passing_score": "700/1000",
                "cost": "$165 USD"
            },
            "tips": [
                "Practice configuring Azure AD features in a lab environment",
                "Focus on conditional access policies and implementation",
                "Study identity governance and lifecycle management",
                "Understand hybrid identity scenarios"
            ]
        },
        "SC-900": {
            "name": "Microsoft Security, Compliance, & Identity Fundamentals",
            "topics": ["Security, compliance, and identity concepts", "Microsoft identity and access management", "Microsoft security solutions", "Microsoft compliance solutions"],
            "difficulty": "fundamental",
            "estimated_hours": 40,
            "exam_info": {
                "estimated_prep_time": "40-60 hours",
                "difficulty_level": "Fundamental",
                "topics_count": 4,
                "duration": "60 minutes",
                "questions": "40-60 questions",
                "passing_score": "700/1000",
                "cost": "$99 USD"
            },
            "tips": [
                "Focus on understanding core security concepts",
                "Study Microsoft's security, compliance, and identity solutions overview",
                "Use Microsoft Learn modules for structured learning",
                "Take practice tests to familiarize with question formats"
            ]
        }
    }
    
    @classmethod
    def get_available_certifications(cls) -> Dict[str, Dict[str, Any]]:
        """Get all available Microsoft security certifications"""
        return cls.SUPPORTED_CERTIFICATIONS
    
    @classmethod
    def generate_study_plan(cls, certification: str, duration_days: int, daily_hours: float) -> Dict[str, Any]:
        """Generate an AI-powered study plan based on certification, duration, and daily hours"""
        if certification not in cls.SUPPORTED_CERTIFICATIONS:
            raise ValueError(f"Certification {certification} not supported")
        
        try:
            # Use AI to generate the study plan (daily_plan only)
            ai_plan = generate_ai_study_plan(certification, duration_days, daily_hours)
            
            # Add hardcoded exam_info and tips from certification data
            cert_data = cls.SUPPORTED_CERTIFICATIONS[certification]
            ai_plan["exam_info"] = cert_data["exam_info"]
            ai_plan["tips"] = cert_data["tips"]
            
            return ai_plan
        except Exception as e:
            raise Exception(f"Failed to generate AI study plan: {str(e)}")
    

    

    
    @classmethod
    def create_study_plan(cls, db: Session, user_id: int, certification: str, duration_days: int, daily_hours: float) -> StudyPlan:
        """Create and save a study plan to database"""
        # Generate the AI plan
        ai_plan = cls.generate_study_plan(certification, duration_days, daily_hours)
        
        # Always create a new plan (allow multiple plans per certification)
        study_plan = StudyPlan(
            user_id=user_id,
            certification=certification,
            certification_name=ai_plan["certification_name"],
            duration_days=duration_days,
            daily_hours=daily_hours,
            plan_content=ai_plan
        )
        db.add(study_plan)
        db.commit()
        db.refresh(study_plan)
        return study_plan
    
    @classmethod
    def get_user_study_plans(cls, db: Session, user_id: int) -> List[StudyPlan]:
        """Get all study plans for a user"""
        return db.query(StudyPlan).filter(StudyPlan.user_id == user_id).order_by(StudyPlan.created_at.desc()).all()
    
    @classmethod
    def get_study_plan(cls, db: Session, plan_id: int, user_id: int) -> StudyPlan:
        """Get a specific study plan for a user"""
        return db.query(StudyPlan).filter(
            StudyPlan.id == plan_id,
            StudyPlan.user_id == user_id
        ).first()
    
    @classmethod
    def delete_study_plan(cls, db: Session, plan_id: int, user_id: int) -> bool:
        """Delete a study plan and its related progress records"""
        from models.study_plan_progress import StudyPlanProgress
        
        plan = cls.get_study_plan(db, plan_id, user_id)
        if plan:
            # Delete related progress records first
            db.query(StudyPlanProgress).filter(
                StudyPlanProgress.study_plan_id == plan_id
            ).delete()
            
            # Then delete the study plan
            db.delete(plan)
            db.commit()
            return True
        return False
    

    

    
    @classmethod
    def get_allowed_durations(cls, user_role: UserRole) -> List[int]:
        """Get allowed study plan durations based on user role"""
        if user_role == UserRole.FREE:
            return [7]  # 7-day plan for free users
        else:
            return [30, 60, 90]  # 30, 60, 90-day plans for premium users