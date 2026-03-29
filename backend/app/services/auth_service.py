"""
Authentication service for user profile management.
"""
import logging
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Profile, UserRole
from ..core.security import ClerkUser

logger = logging.getLogger(__name__)


class AuthService:
    """Service for authentication-related operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_profile(self, user: ClerkUser) -> Profile:
        """
        Get existing profile or create new one from Clerk user.
        
        Args:
            user: Clerk user data from JWT
            
        Returns:
            Profile instance
        """
        # Look up existing profile
        stmt = select(Profile).where(Profile.id == user.id)
        result = await self.db.execute(stmt)
        profile = result.scalar_one_or_none()
        
        if profile:
            # Update profile with latest data from Clerk
            updated = False
            
            if user.email and profile.email != user.email:
                profile.email = user.email
                updated = True
            
            if user.full_name and profile.full_name != user.full_name:
                profile.full_name = user.full_name
                updated = True
            
            if user.image_url and profile.avatar_url != user.image_url:
                profile.avatar_url = user.image_url
                updated = True
            
            if user.username and profile.username != user.username:
                # Check if username is available
                if await self._is_username_available(user.username, user.id):
                    profile.username = user.username
                    updated = True
            
            if updated:
                await self.db.commit()
                await self.db.refresh(profile)
                logger.info(f"Updated profile for user {user.id}")
            
            return profile
        
        # Create new profile
        username = user.username or user.email.split("@")[0]
        username = await self._ensure_unique_username(username)
        
        profile = Profile(
            id=user.id,
            username=username,
            email=user.email,
            full_name=user.full_name,
            avatar_url=user.image_url,
            bio=None,
            website=None,
            role=UserRole.BUYER,
            lifetime_sales=0.0
        )
        
        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(profile)
        
        logger.info(f"Created new profile for user {user.id}")
        return profile

    async def _is_username_available(self, username: str, user_id: str) -> bool:
        """Check if username is available (not taken by another user)."""
        stmt = select(Profile).where(Profile.username == username, Profile.id != user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none() is None

    async def _ensure_unique_username(self, base_username: str) -> str:
        """Generate a unique username by appending numbers if needed."""
        username = base_username
        counter = 1
        
        while True:
            stmt = select(Profile).where(Profile.username == username)
            result = await self.db.execute(stmt)
            if result.scalar_one_or_none() is None:
                return username
            
            counter += 1
            username = f"{base_username}{counter}"

    async def update_profile(
        self,
        user_id: str,
        username: Optional[str] = None,
        full_name: Optional[str] = None,
        bio: Optional[str] = None,
        website: Optional[str] = None,
        avatar_url: Optional[str] = None
    ) -> Optional[Profile]:
        """
        Update user profile.
        
        Args:
            user_id: User ID
            username: New username (optional)
            full_name: New full name (optional)
            bio: New bio (optional)
            website: New website (optional)
            avatar_url: New avatar URL (optional)
            
        Returns:
            Updated profile or None if not found
        """
        stmt = select(Profile).where(Profile.id == user_id)
        result = await self.db.execute(stmt)
        profile = result.scalar_one_or_none()
        
        if not profile:
            return None
        
        if username and username != profile.username:
            if await self._is_username_available(username, user_id):
                profile.username = username
        
        if full_name is not None:
            profile.full_name = full_name
        
        if bio is not None:
            profile.bio = bio
        
        if website is not None:
            profile.website = website
        
        if avatar_url is not None:
            profile.avatar_url = avatar_url
        
        await self.db.commit()
        await self.db.refresh(profile)
        
        return profile

    async def get_profile(self, user_id: str) -> Optional[Profile]:
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
