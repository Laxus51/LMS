from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from core.database import Base

class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    status = Column(String, default="not started")

    __table_args__ = (UniqueConstraint('user_id', 'module_id', name='user_module_unique'),)
