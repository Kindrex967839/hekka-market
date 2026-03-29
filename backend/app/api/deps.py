"""
API dependencies for dependency injection.
"""
from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..core.security import verify_jwt_token, extract_bearer_token, ClerkUser
from ..core.config import settings
from ..models import Profile, UserRole

# Bearer token security scheme
security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[ClerkUser]:
    """
    Get current user from JWT token (optional).
    Returns None if no valid token provided.
    """
    if not credentials:
        return None
    
    token = credentials.credentials
    user = await verify_jwt_token(token)
    return user


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> ClerkUser:
    """
    Get current user from JWT token (required).
    Raises 401 if no valid token provided.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    user = await verify_jwt_token(token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_current_user_with_profile(
    user: ClerkUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> tuple[ClerkUser, Profile]:
    """
    Get current user with their profile from database.
    Creates profile if it doesn't exist.
    """
    from sqlalchemy import select
    
    # Look up profile
    stmt = select(Profile).where(Profile.id == user.id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()
    
    # Create profile if doesn't exist
    if not profile:
        profile = Profile(
            id=user.id,
            username=user.username or user.email.split("@")[0],
            email=user.email,
            full_name=user.full_name,
            avatar_url=user.image_url,
            role=UserRole.BUYER
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    
    return user, profile


async def get_seller_user(
    user_profile: tuple[ClerkUser, Profile] = Depends(get_current_user_with_profile)
) -> tuple[ClerkUser, Profile]:
    """
    Require user to have seller role.
    """
    user, profile = user_profile
    
    if profile.role not in [UserRole.SELLER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seller access required"
        )
    
    return user, profile


async def get_admin_user(
    user_profile: tuple[ClerkUser, Profile] = Depends(get_current_user_with_profile)
) -> tuple[ClerkUser, Profile]:
    """
    Require user to have admin role.
    """
    user, profile = user_profile
    
    if profile.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return user, profile
