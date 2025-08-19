from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ProgressOut(BaseModel):
    id: int
    user_id: int
    module_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class ProgressCreate(BaseModel):
    module_id: int
    status: str = "not started"

class ProgressUpdate(BaseModel):
    status: Optional[str] = None
