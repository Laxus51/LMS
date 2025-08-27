from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from routers import health, user, courses, module, progress, notifications, google_auth, dashboard, chat
from core.database import create_tables
from core.error_handlers import init_error_handlers
from core.middleware import ResponseTimeMiddleware
from core import config

# Import logging configuration before app startup
from core.logging_config import get_logger

# Initialize logger
logger = get_logger()
logger.info("Starting FastAPI LMS application")

app = FastAPI()

# Initialize database tables
try:
    create_tables()
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Failed to create database tables: {e}")
    # Continue startup even if table creation fails

init_error_handlers(app)

# CORS middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware order as specified:
# 1. SessionMiddleware for OAuth2 session handling
app.add_middleware(SessionMiddleware, secret_key=config.SESSION_SECRET_KEY)

# 2. Logging middleware (ResponseTimeMiddleware with integrated logging)
app.add_middleware(ResponseTimeMiddleware)

# Include Routers
app.include_router(health.router)
app.include_router(user.router)
app.include_router(courses.router)
app.include_router(progress.router)
app.include_router(module.router)
app.include_router(notifications.router)
app.include_router(google_auth.router)
app.include_router(dashboard.router)
app.include_router(chat.router)
# AI router removed - OpenAI service available for future use

