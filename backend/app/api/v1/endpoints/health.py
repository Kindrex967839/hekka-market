"""
Health check endpoint for monitoring.
"""
from fastapi import APIRouter, Response
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ...core.database import check_db_connection

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    timestamp: str
    database: str
    uptime_seconds: Optional[float] = None


class HealthDetail(BaseModel):
    """Detailed health check response."""
    status: str
    version: str
    timestamp: str
    components: dict
    uptime_seconds: Optional[float] = None


# Track startup time
_startup_time = datetime.utcnow()


@router.get("/health", response_model=HealthResponse)
async def health_check(response: Response):
    """
    Basic health check endpoint.
    Returns 200 if healthy, 503 if unhealthy.
    """
    db_healthy = await check_db_connection()
    
    if not db_healthy:
        response.status_code = 503
        return HealthResponse(
            status="unhealthy",
            version="1.0.0",
            timestamp=datetime.utcnow().isoformat(),
            database="disconnected"
        )
    
    uptime = (datetime.utcnow() - _startup_time).total_seconds()
    
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat(),
        database="connected",
        uptime_seconds=uptime
    )


@router.get("/health/detail", response_model=HealthDetail)
async def health_detail(response: Response):
    """
    Detailed health check with component status.
    """
    db_healthy = await check_db_connection()
    
    components = {
        "database": {
            "status": "healthy" if db_healthy else "unhealthy",
            "type": "postgresql"
        },
        "cache": {
            "status": "not_configured",
            "type": "none"
        }
    }
    
    overall_status = "healthy" if db_healthy else "unhealthy"
    
    if not db_healthy:
        response.status_code = 503
    
    uptime = (datetime.utcnow() - _startup_time).total_seconds()
    
    return HealthDetail(
        status=overall_status,
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat(),
        components=components,
        uptime_seconds=uptime
    )


@router.get("/health/ready")
async def readiness(response: Response):
    """
    Readiness probe for Kubernetes/container orchestration.
    Returns 200 only if ready to accept traffic.
    """
    db_healthy = await check_db_connection()
    
    if not db_healthy:
        response.status_code = 503
        return {"ready": False, "reason": "database_not_ready"}
    
    return {"ready": True}


@router.get("/health/live")
async def liveness():
    """
    Liveness probe for Kubernetes/container orchestration.
    Returns 200 if the process is alive (always returns true if this endpoint runs).
    """
    return {"alive": True}
