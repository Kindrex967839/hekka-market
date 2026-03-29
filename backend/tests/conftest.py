"""
Test configuration and fixtures.
Isolated from real database by using in-memory SQLite.
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
import pytest_asyncio
from typing import AsyncGenerator
from unittest.mock import MagicMock
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import StaticPool

# Use in-memory SQLite for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


class Base(DeclarativeBase):
    """Test base class."""
    pass


class TimestampMixin:
    """Mixin for timestamps."""
    pass


# Define minimal models for testing (avoid importing real app)
from sqlalchemy import Column, String, Text, Numeric, Integer, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum


class UserRole(str, enum.Enum):
    BUYER = "buyer"
    SELLER = "seller"
    ADMIN = "admin"


class ProductStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ProductType(str, enum.Enum):
    DIGITAL_DOWNLOAD = "digital_download"
    SUBSCRIPTION = "subscription"


class Profile(Base):
    __tablename__ = "profiles"
    id = Column(String(255), primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255))
    avatar_url = Column(Text)
    bio = Column(Text)
    website = Column(String(500))
    role = Column(String(20), default="buyer")
    lifetime_sales = Column(Numeric(10, 2), default=0.0)


class Category(Base):
    __tablename__ = "categories"
    id = Column(String(36), primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True)


class Product(Base):
    __tablename__ = "products"
    id = Column(String(36), primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    category_id = Column(String(36), ForeignKey("categories.id"))
    seller_id = Column(String(255), nullable=False)
    status = Column(String(20), default="draft")
    product_type = Column(String(20), default="digital_download")
    image_url = Column(Text)
    sales_count = Column(Integer, default=0)


class Cart(Base):
    __tablename__ = "carts"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(255), ForeignKey("profiles.id"))
    session_id = Column(String(255))
    is_active = Column(Boolean, default=True)


class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(String(36), primary_key=True)
    cart_id = Column(String(36), ForeignKey("carts.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    price_at_add = Column(Numeric(10, 2), nullable=False)


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_engine():
    """Create test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session."""
    async_session = sessionmaker(
        db_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session


@pytest.fixture
def mock_clerk_user():
    """Mock Clerk user for testing."""
    from dataclasses import dataclass
    
    @dataclass
    class ClerkUser:
        id: str
        email: str
        email_verified: bool
        username: str
        first_name: str = None
        last_name: str = None
        image_url: str = None
        
        @property
        def full_name(self):
            if self.first_name and self.last_name:
                return f"{self.first_name} {self.last_name}"
            return self.first_name or self.last_name
    
    return ClerkUser(
        id="user_test123",
        email="test@example.com",
        email_verified=True,
        username="testuser",
        first_name="Test",
        last_name="User",
        image_url="https://example.com/avatar.jpg"
    )


@pytest.fixture
def mock_settings():
    """Mock settings for testing."""
    mock = MagicMock()
    mock.database_url = TEST_DATABASE_URL
    mock.debug = True
    mock.environment = "test"
    mock.log_level = "DEBUG"
    mock.clerk_jwks_url = "https://api.clerk.dev/v1/jwks"
    return mock
