from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class ChatMessageBase(BaseModel):
    content: str
    role: MessageRole

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessage(ChatMessageBase):
    id: int
    conversation_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatConversationBase(BaseModel):
    title: Optional[str] = None

class ChatConversationCreate(ChatConversationBase):
    pass

class ChatConversation(ChatConversationBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessage] = []
    
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None

class ChatResponse(BaseModel):
    message: ChatMessage
    conversation_id: int