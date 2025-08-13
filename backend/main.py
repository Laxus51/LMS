from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from routers import health, user, courses, module, progress, notifications, google_auth
from core.database import create_tables
from core.error_handlers import init_error_handlers
from core.middleware import ResponseTimeMiddleware
from core import config


app = FastAPI()

create_tables()

init_error_handlers(app)

# Add SessionMiddleware for OAuth2 session handling
app.add_middleware(SessionMiddleware, secret_key=config.SESSION_SECRET_KEY)

app.add_middleware(ResponseTimeMiddleware)

# Include Routers
app.include_router(health.router)
app.include_router(user.router)
app.include_router(courses.router)
app.include_router(progress.router)
app.include_router(module.router)
app.include_router(notifications.router)
app.include_router(google_auth.router)

