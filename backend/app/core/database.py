"""
Database configuration and session management.
Uses SQLAlchemy async engine with connection pooling.
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool
from contextlib import asynccontextmanager

from .config import settings


# Create async engine
# Use NullPool in development for simpler connection management
engine_kwargs = {
    "echo": settings.debug and settings.log_level == "DEBUG",
    "future": True,
}

# Add pool settings for production
if settings.is_production:
    engine_kwargs.update({
        "pool_size": settings.db_pool_size,
        "max_overflow": settings.db_max_overflow,
        "pool_timeout": settings.db_pool_timeout,
        "pool_pre_ping": True,  # Verify connections before use
    })
else:
    engine_kwargs["poolclass"] = NullPool

engine = create_async_engine(
    settings.effective_database_url,
    **engine_kwargs
)

# Session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that provides a database session.
    Use with FastAPI's Depends():
    
    @app.get("/items")
    async def get_items(db: AsyncSession = Depends(get_db)):
        ...
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_db_context():
    """
    Context manager for database sessions outside of FastAPI.
    
    async with get_db_context() as db:
        result = await db.execute(query)
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db():
    """
    Initialize database - create all tables.
    Usually handled by Alembic migrations.
    """
    from sqlalchemy.ext.asyncio import AsyncEngine
    
    # Import all models to register them
    from ..models import Base  # noqa: F401
    
    async with engine.begin() as conn:
        # Only create tables if they don't exist (for development)
        # In production, use Alembic migrations
        if settings.is_development:
            await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Close database connections."""
    await engine.dispose()


async def check_db_connection() -> bool:
    """Check if database connection is healthy."""
    try:
        async with engine.connect() as conn:
            result = await conn.execute("SELECT 1")
            return result.scalar() == 1
    except Exception:
        return False
