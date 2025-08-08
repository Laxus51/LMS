from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.notification import NotificationCreate, NotificationOut
from models.notification import Notification
from core.database import get_db
from utils.auth import get_current_user, require_admin
from datetime import datetime, timezone

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/", response_model=NotificationOut)
def create_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin)
):
    notification = Notification(
        message=data.message,
        created_by=admin_user["id"],
        created_at=datetime.now(timezone.utc)
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

@router.get("/", response_model=list[NotificationOut])
def list_notifications(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(Notification).order_by(Notification.created_at.desc()).all()
