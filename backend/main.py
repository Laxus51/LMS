from fastapi import FastAPI
from routers import health
from core.database import engine

app = FastAPI()

# Include Routers
app.include_router(health.router)
