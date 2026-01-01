"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.core.config import get_settings
from api.core.logging import LoggingMiddleware, setup_logging
from api.routers import f1, health, meta

# Initialize settings and logging
settings = get_settings()
setup_logging(settings.log_level)

# Create FastAPI app
app = FastAPI(
    title="F1 Race Insights API",
    description="API for F1 race data analysis and predictions",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add structured logging middleware
app.add_middleware(LoggingMiddleware)

# Include routers
app.include_router(health.router)
app.include_router(f1.router)
app.include_router(meta.router)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "F1 Race Insights API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
    }
