from pydantic import BaseModel

class ProgressOut(BaseModel):
    id: int
    module_id: int
    status: str

    model_config = {
        "from_attributes": True
    }
