from sqlalchemy.orm import Session
from models.chat import ChatConversation, ChatMessage, MessageRole
from models.user import User, UserRole
from models.daily_usage import DailyUsage
from schemas.chat import ChatConversationCreate, ChatMessageCreate, ChatRequest
from services.openai_service import tutor_chat
from typing import List, Optional
from datetime import date
import logging

logger = logging.getLogger(__name__)

class ChatService:
    @staticmethod
    def check_chat_access(db: Session, user_id: int) -> dict:
        """
        Check if user has access to chat and return access info
        Returns: {"has_access": bool, "remaining_messages": int, "role": str, "message": str}
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"has_access": False, "remaining_messages": 0, "role": "unknown", "message": "User not found"}
        
        # Mentor role cannot access chat
        if user.role == UserRole.MENTOR:
            return {"has_access": False, "remaining_messages": 0, "role": "mentor", "message": "Chat not available for mentors"}
        
        # Admin and Premium have unlimited access
        if user.role in [UserRole.ADMIN, UserRole.PREMIUM]:
            return {"has_access": True, "remaining_messages": -1, "role": user.role.value, "message": "Unlimited access"}
        
        # Free users have daily limit
        if user.role == UserRole.FREE:
            today = date.today()
            daily_usage = db.query(DailyUsage).filter(
                DailyUsage.user_id == user_id,
                DailyUsage.date == today
            ).first()
            
            messages_used = daily_usage.chat_messages_count if daily_usage else 0
            remaining = max(0, 3 - messages_used)
            
            if remaining > 0:
                return {"has_access": True, "remaining_messages": remaining, "role": "free", "message": f"{remaining} messages remaining today"}
            else:
                return {"has_access": False, "remaining_messages": 0, "role": "free", "message": "Daily limit reached. Upgrade to Premium to continue"}
        
        return {"has_access": False, "remaining_messages": 0, "role": user.role.value, "message": "Unknown role"}
    
    @staticmethod
    def increment_daily_usage(db: Session, user_id: int):
        """
        Increment the daily chat message count for a user
        """
        today = date.today()
        daily_usage = db.query(DailyUsage).filter(
            DailyUsage.user_id == user_id,
            DailyUsage.date == today
        ).first()
        
        if daily_usage:
            daily_usage.chat_messages_count += 1
        else:
            daily_usage = DailyUsage(
                user_id=user_id,
                date=today,
                chat_messages_count=1
            )
            db.add(daily_usage)
        
        db.commit()
    
    @staticmethod
    def create_conversation(db: Session, user_id: int, title: Optional[str] = None) -> ChatConversation:
        """
        Create a new chat conversation for a user
        """
        conversation = ChatConversation(
            user_id=user_id,
            title=title or "New Conversation"
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation
    
    @staticmethod
    def get_user_conversations(db: Session, user_id: int, limit: int = 50) -> List[ChatConversation]:
        """
        Get all conversations for a user
        """
        return db.query(ChatConversation).filter(
            ChatConversation.user_id == user_id
        ).order_by(ChatConversation.updated_at.desc()).limit(limit).all()
    
    @staticmethod
    def get_conversation_with_messages(db: Session, conversation_id: int, user_id: int) -> Optional[ChatConversation]:
        """
        Get a conversation with all its messages, ensuring it belongs to the user
        """
        return db.query(ChatConversation).filter(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == user_id
        ).first()
    
    @staticmethod
    def add_message(db: Session, conversation_id: int, role: MessageRole, content: str) -> ChatMessage:
        """
        Add a message to a conversation
        """
        message = ChatMessage(
            conversation_id=conversation_id,
            role=role,
            content=content
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return message
    
    @staticmethod
    def process_chat_request(db: Session, user_id: int, chat_request: ChatRequest) -> tuple[ChatMessage, int]:
        """
        Process a chat request and return both user message and AI response
        """
        try:
            # Check user access first
            access_info = ChatService.check_chat_access(db, user_id)
            if not access_info["has_access"]:
                raise ValueError(access_info["message"])
            
            # Get or create conversation
            if chat_request.conversation_id:
                conversation = ChatService.get_conversation_with_messages(
                    db, chat_request.conversation_id, user_id
                )
                if not conversation:
                    raise ValueError("Conversation not found or access denied")
            else:
                # Create new conversation with a title based on the first message
                title = chat_request.message[:50] + "..." if len(chat_request.message) > 50 else chat_request.message
                conversation = ChatService.create_conversation(db, user_id, title)
            
            # Add user message
            user_message = ChatService.add_message(
                db, conversation.id, MessageRole.USER, chat_request.message
            )
            
            # Get conversation history for context
            conversation_history = []
            for msg in conversation.messages[-10:]:  # Last 10 messages for context
                conversation_history.append({
                    "role": msg.role.value,
                    "content": msg.content
                })
            
            # Generate AI response
            ai_response_content = tutor_chat(
                user_question=chat_request.message,
                conversation_history=conversation_history[:-1]  # Exclude the current message
            )
            
            # Add AI response message
            ai_message = ChatService.add_message(
                db, conversation.id, MessageRole.ASSISTANT, ai_response_content
            )
            
            # Increment daily usage for free users
            if access_info["role"] == "free":
                ChatService.increment_daily_usage(db, user_id)
            
            return ai_message, conversation.id
            
        except Exception as e:
            logger.error(f"Error processing chat request: {str(e)}")
            db.rollback()
            raise Exception(f"Failed to process chat request: {str(e)}")
    
    @staticmethod
    def delete_conversation(db: Session, conversation_id: int, user_id: int) -> bool:
        """
        Delete a conversation and all its messages
        """
        conversation = db.query(ChatConversation).filter(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == user_id
        ).first()
        
        if not conversation:
            return False
        
        db.delete(conversation)
        db.commit()
        return True

chat_service = ChatService()