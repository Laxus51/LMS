from fastapi import FastAPI
from routers import health
from routers import user
from core.database import Base, engine 

app = FastAPI()

Base.metadata.create_all(bind=engine)

# Include Routers
app.include_router(health.router)
app.include_router(user.router)

