from fastapi import FastAPI
from routers import health
from routers import user, courses, module, progress, notifications
from core.database import create_tables


app = FastAPI()

create_tables()

# Include Routers
app.include_router(health.router)
app.include_router(user.router)
app.include_router(courses.router)
app.include_router(progress.router)
app.include_router(module.router)
app.include_router(notifications.router)

