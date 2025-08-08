from pydantic import BaseModel

class CourseCreate(BaseModel):
    title: str
    description: str
    instructor_name: str

class CourseOut(BaseModel):
    id: int
    title: str
    description: str
    instructor_name: str

    model_config = {
        "from_attributes": True
    }
