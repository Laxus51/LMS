from sqlalchemy import Column, Integer, String, Boolean
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")
    name = Column(String, nullable=True)
    auth_method = Column(String, nullable=False, default="email")  # "email" or "google"
    has_password = Column(Boolean, nullable=False, default=True)  # False for OAuth users who haven't set a password
