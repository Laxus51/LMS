from pydantic import BaseModel
from datetime import datetime

class NotificationCreate(BaseModel):
    message: str

class NotificationOut(BaseModel):
    id: int
    message: str
    created_at: datetime
    created_by: int

    model_config = {
        "from_attributes": True
    }
