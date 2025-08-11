"""FastAPI application for EmblemHealth Component Tracker."""

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

from config import settings
from database import create_tables
import schemas

# Import routers
from routers import auth, users, towers, components, releases, activities, websocket, files, analytics

# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="EmblemHealth Component Tracker - FastAPI Backend",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(towers.router, prefix="/api")
app.include_router(components.router, prefix="/api")
app.include_router(releases.router, prefix="/api")
app.include_router(activities.router, prefix="/api")
app.include_router(websocket.router)
app.include_router(files.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


@app.on_event("startup")
def startup_event():
    """Initialize database on startup."""
    create_tables()
    print(f"🏥 {settings.app_name} v{settings.app_version} starting up...")
    print(f"📊 Database: {settings.database_url}")
    print(f"🌐 CORS enabled for: {', '.join(settings.allowed_origins)}")
    print(f"🚀 Ready to serve requests!")


@app.get("/")
def read_root():
    """Root endpoint with API information."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "docs_url": "/docs" if settings.debug else None
    }


@app.get("/healthz", response_model=schemas.HealthCheck)
def health_check():
    """Health check endpoint for monitoring."""
    return schemas.HealthCheck(
        status="healthy",
        timestamp=datetime.utcnow(),
        version=settings.app_version
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info"
    )
