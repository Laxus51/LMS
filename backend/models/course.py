from sqlalchemy import Column, Integer, String
from core.database import Base
from sqlalchemy.orm import relationship

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    instructor_name = Column(String, nullable=False)
    modules = relationship("Module", back_populates="course", cascade="all, delete")

