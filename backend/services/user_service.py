from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.user import User
from schemas.user import UserCreate, UserProfileUpdate
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta, timezone
from core import config
from typing import Optional, Dict, Any

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user in the database."""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        hashed_password = get_password_hash(user.password)
        new_user = User(
            email=user.email, 
            hashed_password=hashed_password, 
            name=user.name,
            role=user.role  # Use role from schema (defaults to FREE)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(db: Session, email: str, password: str) -> User:
    """Authenticate a user with email and password."""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user

def create_access_token(data: Dict[str, Any]) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=config.JWT_EXPIRATION_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, config.JWT_SECRET_KEY, algorithm=config.JWT_ALGORITHM)

def get_user_by_id(db: Session, user_id: int) -> User:
    """Get a user by their ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by their email."""
    return db.query(User).filter(User.email == email).first()

def get_user_by_email_strict(db: Session, email: str) -> User:
    """Get a user by their email, raise exception if not found."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def update_user_profile(db: Session, user_id: int, update_data: UserProfileUpdate) -> User:
    """Update a user's profile information."""
    user = get_user_by_id(db, user_id)
    
    try:
        if update_data.name is not None:
            user.name = update_data.name
        if update_data.password is not None:
            # For OAuth users who haven't set a password yet, allow setting any password
            if user.has_password:
                # Check if the new password is the same as the current one
                if verify_password(update_data.password, user.hashed_password):
                    raise HTTPException(status_code=400, detail="New password cannot be the same as the current password")
            
            user.hashed_password = get_password_hash(update_data.password)
            user.has_password = True  # Mark that user now has a password
        
        db.commit()
        db.refresh(user)
        return user
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update user profile: {str(e)}")

def get_all_users(db: Session) -> list[User]:
    """Get all users (admin function)."""
    return db.query(User).order_by(User.id.asc()).all()

def delete_user(db: Session, user_id: int) -> bool:
    """Delete a user by ID. Returns True on success."""
    from models.user import UserRole
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Prevent deleting the last admin
    if user.role == UserRole.ADMIN:
        admin_count = db.query(User).filter(User.role == UserRole.ADMIN).count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete the last admin account")
    try:
        db.delete(user)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")

def update_user_role(db: Session, user_id: int, new_role: str) -> User:
    """Update a user's role (admin function)."""
    from models.user import UserRole
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        role_map = {r.value: r for r in UserRole}
        if new_role not in role_map:
            raise HTTPException(status_code=400, detail=f"Invalid role: {new_role}")
        user.role = role_map[new_role]
        db.commit()
        db.refresh(user)
        return user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update role: {str(e)}")

def create_user_oauth(db: Session, user: UserCreate) -> User:
    """Create a new user for OAuth (without checking if user exists)."""
    try:
        hashed_password = get_password_hash(user.password)
        new_user = User(
            email=user.email, 
            hashed_password=hashed_password, 
            name=user.name,
            role=user.role,  # Use role from schema (defaults to FREE)
            auth_method="google",
            has_password=False  # OAuth users start without a user-set password
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")
