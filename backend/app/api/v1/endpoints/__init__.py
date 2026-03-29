"""API v1 endpoints."""
from fastapi import APIRouter
from .health import router as health_router

router = APIRouter()

# Include all endpoint routers
router.include_router(health_router, tags=["health"])

__all__ = ["router"]
