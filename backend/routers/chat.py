from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from utils.auth import get_current_user
from schemas.chat import ChatRequest, ChatResponse, ChatConversation, ChatMessage
from services.chat_service import chat_service
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/send", response_model=ChatResponse)
async def send_message(
    chat_request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Send a message to the AI tutor and get a response
    """
    try:
        ai_message, conversation_id = chat_service.process_chat_request(
            db=db,
            user_id=current_user["id"],
            chat_request=chat_request
        )
        
        return ChatResponse(
            message=ai_message,
            conversation_id=conversation_id
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error in send_message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process chat message"
        )

@router.get("/conversations", response_model=List[ChatConversation])
async def get_conversations(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get all conversations for the current user
    """
    try:
        conversations = chat_service.get_user_conversations(
            db=db,
            user_id=current_user["id"]
        )
        return conversations
        
    except Exception as e:
        logger.error(f"Error in get_conversations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversations"
        )

@router.get("/conversations/{conversation_id}", response_model=ChatConversation)
async def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get a specific conversation with all its messages
    """
    try:
        conversation = chat_service.get_conversation_with_messages(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user["id"]
        )
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        return conversation
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_conversation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversation"
        )

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Delete a conversation and all its messages
    """
    try:
        success = chat_service.delete_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user["id"]
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        return {"message": "Conversation deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_conversation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete conversation"
        )

@router.post("/conversations", response_model=ChatConversation)
async def create_conversation(
    title: str = "New Conversation",
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Create a new conversation
    """
    try:
        conversation = chat_service.create_conversation(
            db=db,
            user_id=current_user["id"],
            title=title
        )
        return conversation
        
    except Exception as e:
        logger.error(f"Error in create_conversation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create conversation"
        )

@router.get("/access-status")
async def get_chat_access_status(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get user's chat access status and remaining quota
    """
    try:
        access_info = chat_service.check_chat_access(db, current_user["id"])
        return {
            "has_access": access_info["has_access"],
            "remaining_messages": access_info["remaining_messages"],
            "role": access_info["role"],
            "message": access_info["message"]
        }
    except Exception as e:
        logger.error(f"Error getting chat access status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get chat access status: {str(e)}"
        )