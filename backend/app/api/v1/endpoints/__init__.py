"""API v1 endpoints."""
from fastapi import APIRouter
from .health import router as health_router
from .auth import router as auth_router

router = APIRouter()

# Include all endpoint routers
router.include_router(health_router, tags=["health"])
router.include_router(auth_router, prefix="/auth", tags=["auth"])

__all__ = ["router"]
