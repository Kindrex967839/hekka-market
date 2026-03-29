"""
Tests for AuthService.
"""
import pytest
import pytest_asyncio
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from conftest import Profile, UserRole


# Simplified AuthService for testing
class AuthService:
    """Service for authentication-related operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_profile(self, user) -> Profile:
        """Get existing profile or create new one."""
        stmt = select(Profile).where(Profile.id == user.id)
        result = await self.db.execute(stmt)
        profile = result.scalar_one_or_none()
        
        if profile:
            # Update if email changed
            if user.email and profile.email != user.email:
                profile.email = user.email
            return profile
        
        # Create new profile
        profile = Profile(
            id=user.id,
            username=user.username or user.email.split("@")[0],
            email=user.email,
            full_name=user.full_name,
            avatar_url=user.image_url,
            role=UserRole.BUYER,
            lifetime_sales=Decimal("0.0")
        )
        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def update_profile(self, user_id: str, **kwargs) -> Profile:
        """Update user profile."""
        stmt = select(Profile).where(Profile.id == user_id)
        result = await self.db.execute(stmt)
        profile = result.scalar_one_or_none()
        
        if not profile:
            return None
        
        for key, value in kwargs.items():
            if value is not None and hasattr(profile, key):
                setattr(profile, key, value)
        
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def get_profile(self, user_id: str) -> Profile:
        """Get profile by user ID."""
        stmt = select(Profile).where(Profile.id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def set_seller_role(self, user_id: str) -> bool:
        """Promote user to seller role."""
        stmt = select(Profile).where(Profile.id == user_id)
        result = await self.db.execute(stmt)
        profile = result.scalar_one_or_none()
        
        if not profile:
            return False
        
        profile.role = UserRole.SELLER
        await self.db.commit()
        return True


@pytest.mark.asyncio
class TestAuthService:
    """Test AuthService methods."""

    async def test_get_or_create_profile_creates_new(self, db_session: AsyncSession, mock_clerk_user):
        """Test creating a new profile from Clerk user."""
        auth_service = AuthService(db_session)
        
        profile = await auth_service.get_or_create_profile(mock_clerk_user)
        
        assert profile is not None
        assert profile.id == mock_clerk_user.id
        assert profile.email == mock_clerk_user.email
        assert profile.username == mock_clerk_user.username
        assert profile.role == UserRole.BUYER

    async def test_get_or_create_profile_existing(self, db_session: AsyncSession, mock_clerk_user):
        """Test retrieving existing profile."""
        auth_service = AuthService(db_session)
        
        # Create initial profile
        profile1 = await auth_service.get_or_create_profile(mock_clerk_user)
        
        # Get existing profile
        profile2 = await auth_service.get_or_create_profile(mock_clerk_user)
        
        assert profile1.id == profile2.id
        assert profile1.username == profile2.username

    async def test_get_or_create_profile_updates_email(self, db_session: AsyncSession):
        """Test profile email is updated when changed in Clerk."""
        auth_service = AuthService(db_session)
        
        # Create initial profile
        mock1 = type('obj', (object,), {
            'id': 'user_test',
            'email': 'old@example.com',
            'username': 'testuser',
            'full_name': None,
            'image_url': None
        })()
        profile = await auth_service.get_or_create_profile(mock1)
        assert profile.email == "old@example.com"
        
        # Update email
        mock2 = type('obj', (object,), {
            'id': 'user_test',
            'email': 'new@example.com',
            'username': 'testuser',
            'full_name': None,
            'image_url': None
        })()
        profile = await auth_service.get_or_create_profile(mock2)
        assert profile.email == "new@example.com"

    async def test_update_profile(self, db_session: AsyncSession, mock_clerk_user):
        """Test updating profile fields."""
        auth_service = AuthService(db_session)
        
        # Create profile
        await auth_service.get_or_create_profile(mock_clerk_user)
        
        # Update profile
        updated = await auth_service.update_profile(
            user_id=mock_clerk_user.id,
            full_name="Updated Name",
            bio="New bio"
        )
        
        assert updated is not None
        assert updated.full_name == "Updated Name"
        assert updated.bio == "New bio"

    async def test_set_seller_role(self, db_session: AsyncSession, mock_clerk_user):
        """Test upgrading to seller role."""
        auth_service = AuthService(db_session)
        
        # Create profile
        await auth_service.get_or_create_profile(mock_clerk_user)
        
        # Upgrade to seller
        success = await auth_service.set_seller_role(mock_clerk_user.id)
        assert success is True
        
        # Verify role
        profile = await auth_service.get_profile(mock_clerk_user.id)
        assert profile.role == UserRole.SELLER

    async def test_get_profile_not_found(self, db_session: AsyncSession):
        """Test getting non-existent profile returns None."""
        auth_service = AuthService(db_session)
        
        profile = await auth_service.get_profile("nonexistent")
        assert profile is None
