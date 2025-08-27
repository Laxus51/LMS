from sqlalchemy import Column, Integer, String, Boolean, Enum
from core.database import Base
import enum

class UserRole(enum.Enum):
    FREE = "free"
    PREMIUM = "premium"
    MENTOR = "mentor"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.FREE)
    name = Column(String, nullable=True)
    auth_method = Column(String, nullable=False, default="email")  # "email" or "google"
    has_password = Column(Boolean, nullable=False, default=True)  # False for OAuth users who haven't set a password
