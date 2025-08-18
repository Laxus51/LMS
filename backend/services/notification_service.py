from sqlalchemy.orm import Session
from models.notification import Notification
from schemas.notification import NotificationCreate
from fastapi import HTTPException
from datetime import datetime, timezone
from typing import List

def create_notification(db: Session, notification_data: NotificationCreate, created_by: int) -> Notification:
    """Create a new notification in the database."""
    try:
        notification = Notification(
            message=notification_data.message,
            created_by=created_by,
            created_at=datetime.now(timezone.utc)
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create notification: {str(e)}")

def get_all_notifications(db: Session) -> List[Notification]:
    """Retrieve all notifications ordered by creation date (newest first)."""
    return db.query(Notification).order_by(Notification.created_at.desc()).all()

def get_notification_by_id(db: Session, notification_id: int) -> Notification:
    """Get a notification by its ID."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

def mark_notification_as_read(db: Session, notification_id: int) -> Notification:
    """Mark a notification as read."""
    try:
        notification = get_notification_by_id(db, notification_id)
        notification.is_read = True
        db.commit()
        db.refresh(notification)
        return notification
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to mark notification as read: {str(e)}")