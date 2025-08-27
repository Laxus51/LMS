from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
import enum

class MessageRole(enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"

class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=True)  # Optional conversation title
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversation_id = Column(Integer, ForeignKey("chat_conversations.id"), nullable=False)
    role = Column(Enum(MessageRole), nullable=False)  # user or assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    conversation = relationship("ChatConversation", back_populates="messages")