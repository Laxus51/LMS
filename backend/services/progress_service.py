from sqlalchemy.orm import Session
from models.progress import Progress

def mark_module_completed(db: Session, user_id: int, module_id: int):
    progress = db.query(Progress).filter_by(user_id=user_id, module_id=module_id).first()

    if progress:
        progress.status = "completed"
    else:
        progress = Progress(user_id=user_id, module_id=module_id, status="completed")
        db.add(progress)

    db.commit()
    db.refresh(progress)
    return progress
