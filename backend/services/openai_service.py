from openai import OpenAI
from typing import List, Dict
from core import config
import logging
import time
import json

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        if not config.OPENAI_API_KEY:
            raise ValueError("OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.")
        
        self.client = OpenAI(api_key=config.OPENAI_API_KEY)
        self.model = config.OPENAI_MODEL
        self.max_tokens = config.OPENAI_MAX_TOKENS
        self.temperature = config.OPENAI_TEMPERATURE
        
        # Rate limiting
        self.last_request_time = 0
        self.min_request_interval = 0.2  # Reduced to 200ms between requests for faster generation
    
    def _rate_limit(self):
        """Simple rate limiting to avoid hitting API limits"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.min_request_interval:
            sleep_time = self.min_request_interval - time_since_last
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
    

    

    

    
    def tutor_chat_response(self, user_question: str, conversation_history: List[Dict[str, str]] = None) -> str:
        """
        Generate a tutor response using Microsoft Trainer persona
        
        Args:
            user_question: The student's question
            conversation_history: Previous messages in the conversation
            
        Returns:
            AI tutor response as a string
        """
        try:
            self._rate_limit()
            
            system_message = """
                You are a certified Microsoft Trainer specializing in Azure and Microsoft security. 
                Your job is to tutor students preparing for certifications like AZ-900, SC-900, and AZ-104. 

                When answering:
                - Be clear, structured, and exam-focused
                - Provide explanations in plain text without using markdown formatting
                - Do not use hashtags (#), asterisks (*), or other markdown symbols
                - Use simple paragraph breaks and natural language flow
                - Include real-world Microsoft Azure examples
                - Keep answers detailed but concise
                - End with a brief summary when helpful
                - Write in a conversational, easy-to-read format
                """

            
            # Build conversation context
            messages = [{"role": "system", "content": system_message}]
            
            # Add conversation history if provided
            if conversation_history:
                for msg in conversation_history[-10:]:  # Keep last 10 messages for context
                    messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })
            
            # Add current user question
            messages.append({"role": "user", "content": user_question})
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=0.7  # Slightly creative but focused
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating tutor response: {str(e)}")
            raise Exception(f"Failed to generate tutor response: {str(e)}")

    def generate_study_plan(self, certification: str, duration_days: int, daily_hours: float) -> Dict:
        """
        Generate a personalized study plan using AI based on certification, duration, and daily hours
        
        Args:
            certification: The certification code (e.g., 'SC-100', 'SC-200')
            duration_days: Number of days for the study plan
            daily_hours: Hours to study per day
            
        Returns:
            AI-generated study plan as a dictionary
        """
        try:
            start_time = time.time()
            logger.info(f"Starting study plan generation for {certification}, {duration_days} days, {daily_hours} hours/day")
            
            # Remove rate limiting for better performance
            # self._rate_limit()
            
            system_message = f"""
Create a {duration_days}-day study plan for {certification} certification ({daily_hours}h/day).

Return JSON only:
{{
    "certification": "{certification}",
    "certification_name": "Full name",
    "duration_days": {duration_days},
    "daily_hours": {daily_hours},
    "total_hours": {duration_days * daily_hours},
    "difficulty": "fundamental|intermediate|expert",
    "daily_plan": [
        {{
            "day": 1,
            "topic": "Topic",
            "activities": [
                {{"task": "Activity", "time_minutes": 60}}
            ],
            "hours": {daily_hours},
            "resources": ["Resource"]
        }}
    ]
}}

Requirements:
- Progressive topics covering exam objectives
- 2-4 activities per day
- Activities: reading, labs, practice tests
- Time must sum to {int(daily_hours * 60)} minutes/day
- Include Microsoft Learn modules
                """
            
            messages = [{"role": "system", "content": system_message}]
            messages.append({"role": "user", "content": f"Create {duration_days}-day plan for {certification}."})
            
            # Adjust max_tokens based on duration to prevent JSON truncation
            # 7-day: 2000 tokens, 30-day: 4000 tokens, 60-day: 6000 tokens, 90-day: 8000 tokens
            if duration_days <= 7:
                max_tokens = 2000
            elif duration_days <= 30:
                max_tokens = 4000
            elif duration_days <= 60:
                max_tokens = 6000
            else:
                max_tokens = 8000
            
            openai_start_time = time.time()
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.1   # Lower temperature for faster, more deterministic output
            )
            openai_end_time = time.time()
            openai_duration = openai_end_time - openai_start_time
            logger.info(f"OpenAI API call completed in {openai_duration:.2f} seconds")
            
            response_content = response.choices[0].message.content.strip()
            
            # Parse JSON response
            import json
            try:
                json_start_time = time.time()
                study_plan = json.loads(response_content)
                json_end_time = time.time()
                
                total_duration = time.time() - start_time
                logger.info(f"Study plan generation completed in {total_duration:.2f} seconds (OpenAI: {openai_duration:.2f}s, JSON parsing: {json_end_time - json_start_time:.3f}s)")
                
                return study_plan
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse AI response as JSON: {e}")
                logger.error(f"AI Response: {response_content}")
                raise Exception("AI generated invalid JSON response")
            
        except Exception as e:
            logger.error(f"Error generating study plan: {str(e)}")
            raise Exception(f"Failed to generate study plan: {str(e)}")
    
    def generate_quiz(self, certification: str, topic: str, difficulty: str) -> Dict:
        """Generate a 5-question MCQ quiz using OpenAI"""
        try:
            start_time = time.time()
            self._rate_limit()
            
            # Construct the system message for quiz generation
            system_message = f"""
You are an expert quiz generator for IT certification exams. Generate exactly 5 multiple-choice questions (MCQs) based on the given certification, topic, and difficulty level.

Requirements:
1. Generate exactly 5 questions
2. Each question must have exactly 4 options (A, B, C, D)
3. Provide the correct answer and a detailed explanation
4. Questions should be relevant to the {certification} certification
5. Difficulty level: {difficulty}
6. Topic focus: {topic}

Return the response in this exact JSON format:
{{
    "questions": [
        {{
            "question_id": 1,
            "question": "Question text here?",
            "options": [
                {{"option_id": "A", "text": "Option A text"}},
                {{"option_id": "B", "text": "Option B text"}},
                {{"option_id": "C", "text": "Option C text"}},
                {{"option_id": "D", "text": "Option D text"}}
            ],
            "correct_answer": "A",
            "explanation": "Detailed explanation of why this answer is correct"
        }}
    ]
}}

Ensure all questions are:
- Technically accurate and up-to-date
- Appropriate for the {difficulty} difficulty level
- Focused on {topic} within {certification}
- Have clear, unambiguous correct answers
- Include comprehensive explanations
"""
            
            user_message = f"Generate a {difficulty} level quiz with 5 MCQ questions about {topic} for the {certification} certification exam."
            
            logger.info(f"Generating quiz for {certification} - Topic: {topic}, Difficulty: {difficulty}")
            
            openai_start_time = time.time()
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=3000,  # Sufficient for 5 questions with explanations
                temperature=0.1
            )
            openai_duration = time.time() - openai_start_time
            
            response_content = response.choices[0].message.content.strip()
            logger.info(f"OpenAI API call completed in {openai_duration:.2f} seconds")
            
            # Parse the JSON response
            try:
                json_start_time = time.time()
                quiz_data = json.loads(response_content)
                json_end_time = time.time()
                
                # Validate the structure
                if "questions" not in quiz_data or len(quiz_data["questions"]) != 5:
                    raise ValueError("Invalid quiz structure: must contain exactly 5 questions")
                
                for i, question in enumerate(quiz_data["questions"], 1):
                    required_fields = ["question_id", "question", "options", "correct_answer", "explanation"]
                    for field in required_fields:
                        if field not in question:
                            raise ValueError(f"Question {i} missing required field: {field}")
                    
                    if len(question["options"]) != 4:
                        raise ValueError(f"Question {i} must have exactly 4 options")
                    
                    # Validate option structure
                    for option in question["options"]:
                        if "option_id" not in option or "text" not in option:
                            raise ValueError(f"Question {i} has invalid option structure")
                
                total_duration = time.time() - start_time
                logger.info(f"Quiz generation completed in {total_duration:.2f} seconds (OpenAI: {openai_duration:.2f}s, JSON parsing: {json_end_time - json_start_time:.3f}s)")
                
                return quiz_data
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse AI response as JSON: {e}")
                logger.error(f"AI Response: {response_content}")
                raise Exception("AI generated invalid JSON response")
            except ValueError as e:
                logger.error(f"Quiz validation failed: {e}")
                logger.error(f"AI Response: {response_content}")
                raise Exception(f"Invalid quiz format: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error generating quiz: {str(e)}")
            raise Exception(f"Failed to generate quiz: {str(e)}")

# Global instance
openai_service = OpenAIService()

# Utility function for tutor chat
def tutor_chat(user_question: str, conversation_history: List[Dict[str, str]] = None) -> str:
    """Convenience function for tutor chat"""
    return openai_service.tutor_chat_response(user_question, conversation_history)

# Utility function for study plan generation
def generate_ai_study_plan(certification: str, duration_days: int, daily_hours: float) -> Dict:
    """Convenience function for AI study plan generation"""
    return openai_service.generate_study_plan(certification, duration_days, daily_hours)

# Utility function for quiz generation
def generate_ai_quiz(certification: str, topic: str, difficulty: str) -> Dict:
    """Convenience function for AI quiz generation"""
    return openai_service.generate_quiz(certification, topic, difficulty)