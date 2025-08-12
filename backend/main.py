from fastapi import FastAPI
from routers import health, user, courses, module, progress, notifications
from core.database import create_tables
from core.error_handlers import init_error_handlers
from core.middleware import ResponseTimeMiddleware


app = FastAPI()

create_tables()

init_error_handlers(app)

app.add_middleware(ResponseTimeMiddleware)

# Include Routers
app.include_router(health.router)
app.include_router(user.router)
app.include_router(courses.router)
app.include_router(progress.router)
app.include_router(module.router)
app.include_router(notifications.router)

