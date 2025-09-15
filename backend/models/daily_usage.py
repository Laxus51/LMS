from sqlalchemy import Column, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import date

class DailyUsage(Base):
    __tablename__ = "daily_usage"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, default=date.today, nullable=False)
    chat_messages_count = Column(Integer, default=0, nullable=False)
    quiz_count = Column(Integer, default=0, nullable=False)
    
    # Relationships
    user = relationship("User")
    
    # Composite unique constraint to ensure one record per user per day
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )