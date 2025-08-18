from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.notification import NotificationCreate, NotificationOut
from services.notification_service import create_notification, get_all_notifications, mark_notification_as_read
from core.database import get_db
from utils.auth import get_current_user, require_admin
from core.response import success_response, error_response
from typing import List

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/", response_model=NotificationOut)
def create_new_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin)
):
    """Create a new notification (Admin only)."""
    try:
        notification = create_notification(db, data, admin_user["id"])
        return success_response(
            data=NotificationOut.model_validate(notification).model_dump(mode="json"),
            message="Notification created successfully"
        )
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)

@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Mark a notification as read."""
    try:
        notification = mark_notification_as_read(db, notification_id)
        return success_response(
            data=NotificationOut.model_validate(notification).model_dump(mode="json"),
            message="Notification marked as read"
        )
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)

@router.get("/", response_model=List[NotificationOut])
def list_notifications(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get all notifications ordered by creation date."""
    try:
        notifications = get_all_notifications(db)
        return success_response(
            data=[NotificationOut.model_validate(n).model_dump(mode="json") for n in notifications],
            message="Notifications retrieved successfully"
        )
    except HTTPException as e:
        return error_response(message=e.detail, status_code=e.status_code)
    except Exception as e:
        return error_response(message=str(e), status_code=500)
