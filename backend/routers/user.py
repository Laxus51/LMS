from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.user import UserCreate, UserLogin, UserProfileUpdate, UserOut
from services.user_service import (
    create_user, authenticate_user, create_access_token, 
    get_user_by_id, get_user_by_email, update_user_profile, get_all_users
)
from core.database import get_db
from utils.auth import get_current_user, require_admin
from core.response import success_response, error_response
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user and return access token."""
    try:
        new_user = create_user(db, user)
        # Generate access token for the new user
        token_data = {
            "sub": new_user.email,
            "role": new_user.role,
            "id": new_user.id
        }
        access_token = create_access_token(token_data)
        return success_response(
            data={
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": new_user.id,
                    "email": new_user.email,
                    "name": new_user.name,
                    "role": new_user.role
                }
            },
            message="User registered successfully"
        )
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)



@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    try:
        authenticated_user = authenticate_user(db, user.email, user.password)
        token_data = {
            "sub": authenticated_user.email,
            "role": authenticated_user.role,
            "id": authenticated_user.id
        }
        access_token = create_access_token(token_data)
        return success_response(
            data={
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": authenticated_user.id,
                    "email": authenticated_user.email,
                    "name": authenticated_user.name,
                    "role": authenticated_user.role
                }
            },
            message="Login successful"
        )
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)


@router.get("/profile", response_model=UserOut)
def get_profile(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile."""
    try:
        db_user = get_user_by_id(db, user["id"])
        return success_response(
            data=UserOut.model_validate(db_user).model_dump(mode="json"),
            message="Profile retrieved successfully"
        )
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)


@router.put("/profile", response_model=UserOut)
def update_profile(
    update_data: UserProfileUpdate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile."""
    try:
        updated_user = update_user_profile(db, user["id"], update_data)
        return success_response(
            data=UserOut.model_validate(updated_user).model_dump(mode="json"),
            message="Profile updated successfully"
        )
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)


@router.get("/me", response_model=UserOut)
def read_current_user(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user details."""
    try:
        user = get_user_by_email(db, current_user["email"])
        return success_response(
            data=UserOut.model_validate(user).model_dump(mode="json"),
            message="Current user retrieved successfully"
        )
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)

@router.get("/admin/users", response_model=List[UserOut])
def list_all_users(
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin)
):
    """List all users (Admin only)."""
    try:
        users = get_all_users(db)
        return success_response(
            data=[UserOut.model_validate(u).model_dump(mode="json") for u in users],
            message="All users retrieved successfully"
        )
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)
