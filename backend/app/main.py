from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base, SessionLocal
from .models import User
from .services.demo_service import seed_demo_data

# Import routers
from .routes.auth import router as auth_router
from .routes.checkins import router as checkins_router
from .routes.tasks import router as tasks_router
from .routes.remind import router as remind_router
from .routes.dashboard import router as dashboard_router
from .routes.analysis import router as analysis_router
from .routes.interventions import router as interventions_router
from .routes.simulation import router as simulation_router
from .routes.demo import router as demo_router
from chatbot.router import router as chatbot_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed initial data if user does not exist
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            print("[MindOS] Seeding initial demo student baseline...")
            seed_demo_data(db, mode="stressful")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="MindOS Student Wellbeing & Burnout Early Signal Detection Platform",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(checkins_router, prefix=settings.API_PREFIX)
app.include_router(tasks_router, prefix=settings.API_PREFIX)
app.include_router(remind_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(analysis_router, prefix=settings.API_PREFIX)
app.include_router(interventions_router, prefix=settings.API_PREFIX)
app.include_router(simulation_router, prefix=settings.API_PREFIX)
app.include_router(demo_router, prefix=settings.API_PREFIX)
app.include_router(chatbot_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "boundary_notice": "MindOS is a wellbeing-support platform, not a medical diagnostic tool."
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
