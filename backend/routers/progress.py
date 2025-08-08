from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import SessionLocal
from utils.auth import get_current_user
from services.progress_service import mark_module_completed
from schemas.progress import ProgressOut

router = APIRouter(prefix="/modules", tags=["Progress"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/{module_id}/complete", response_model=ProgressOut)
def complete_module(
    module_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["role"] != "user":
        raise HTTPException(status_code=403, detail="Only students can complete modules")
    return mark_module_completed(db, user_id=user["id"], module_id=module_id)
