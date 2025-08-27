from pydantic import BaseModel, EmailStr, constr
from typing import Optional
from models.user import UserRole

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    role: Optional[UserRole] = UserRole.FREE

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    role: UserRole 
    auth_method: str = "email"
    has_password: bool = True

    model_config = {
        "from_attributes": True
    }

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[constr(strip_whitespace=True, min_length=1)] = None
    password: Optional[str] = None
