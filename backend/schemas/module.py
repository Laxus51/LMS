from pydantic import BaseModel

class ModuleBase(BaseModel):
    title: str
    content_link: str

class ModuleCreate(ModuleBase):
    pass

class ModuleOut(ModuleBase):
    id: int

    model_config = {
        "from_attributes": True
    }
