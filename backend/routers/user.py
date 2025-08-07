from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.user import UserCreate, UserOut
from services.user_service import create_user
from core.database import SessionLocal
from schemas.user import UserLogin, UserOut
from services.user_service import authenticate_user, create_access_token
from utils.auth import get_current_user,require_admin
from models.user import User
from utils.auth import get_current_user
from sqlalchemy.orm import Session


router = APIRouter(prefix="/users", tags=["Users"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=UserOut)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    user_obj = authenticate_user(db, user.email, user.password)
    token = create_access_token({
    "sub": user_obj.email,
    "role": user_obj.role 
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_obj.id,
            "email": user_obj.email
        }
    }

@router.get("/profile")
def get_profile(user=Depends(get_current_user)):
    return {"message": f"Welcome, {user['email']}", "role": user["role"]}

@router.get("/me", response_model=UserOut)
def read_current_user(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/admin/users", response_model=list[UserOut])
def list_all_users(
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin)
):
    users = db.query(User).all()
    return users
