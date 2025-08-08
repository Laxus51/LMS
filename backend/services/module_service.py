from sqlalchemy.orm import Session
from models.module import Module
from schemas.module import ModuleCreate

def create_module(db: Session, course_id: int, module_data: ModuleCreate):
    new_module = Module(**module_data.model_dump(), course_id=course_id)
    db.add(new_module)
    db.commit()
    db.refresh(new_module)
    return new_module

def get_modules_by_course(db: Session, course_id: int):
    return db.query(Module).filter(Module.course_id == course_id).all()
