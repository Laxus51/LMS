from openai import OpenAI
from typing import List, Dict
from core import config
import logging
import time

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
        self.min_request_interval = 1.0  # Minimum 1 second between requests
    
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

# Global instance
openai_service = OpenAIService()

# Utility function for tutor chat
def tutor_chat(user_question: str, conversation_history: List[Dict[str, str]] = None) -> str:
    """Convenience function for tutor chat"""
    return openai_service.tutor_chat_response(user_question, conversation_history)