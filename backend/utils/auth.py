from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from core import config
from typing import Dict, List
from models.user import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

def decode_token(token: str) -> Dict:
    try:
        payload = jwt.decode(
            token, config.JWT_SECRET_KEY, algorithms=[config.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    role_str = payload.get("role", "free")
    # Convert string role to UserRole enum
    try:
        role = UserRole(role_str)
    except ValueError:
        role = UserRole.FREE
    
    return {
        "email": payload.get("sub"),
        "role": role,
        "id": payload.get("id")
    }

def require_roles(allowed_roles: List[UserRole]):
    def role_checker(user: Dict = Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[role.value for role in allowed_roles]}"
            )
        return user
    return role_checker

def require_admin(user: Dict = Depends(get_current_user)):
    if user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user

def require_mentor_or_admin(user: Dict = Depends(get_current_user)):
    if user["role"] not in [UserRole.MENTOR, UserRole.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Mentor or admin access required")
    return user

def require_premium_or_above(user: Dict = Depends(get_current_user)):
    if user["role"] not in [UserRole.PREMIUM, UserRole.MENTOR, UserRole.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Premium access required")
    return user
