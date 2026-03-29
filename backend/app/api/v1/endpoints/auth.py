"""
Authentication API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...core.security import ClerkUser
from ...models import Profile
from ..deps import get_current_user, get_current_user_with_profile
from ...services.auth_service import AuthService

router = APIRouter()


class ProfileResponse(BaseModel):
    """Profile response schema."""
    id: str
    username: str
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    website: Optional[str]
    role: str
    lifetime_sales: float

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    """Profile update schema."""
    username: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    website: Optional[str] = None
    avatar_url: Optional[str] = None


class SyncResponse(BaseModel):
    """Sync response schema."""
    message: str
    profile: ProfileResponse
    is_new: bool


@router.post("/sync", response_model=SyncResponse)
async def sync_profile(
    user: ClerkUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Sync user profile from Clerk.
    Creates profile if it doesn't exist.
    
    Called by frontend after Clerk authentication.
    """
    auth_service = AuthService(db)
    profile = await auth_service.get_or_create_profile(user)
    
    # Check if this was a new profile
    is_new = profile.created_at == profile.updated_at
    
    return SyncResponse(
        message="Profile synced successfully",
        profile=ProfileResponse(
            id=profile.id,
            username=profile.username,
            email=profile.email,
            full_name=profile.full_name,
            avatar_url=profile.avatar_url,
            bio=profile.bio,
            website=profile.website,
            role=profile.role.value,
            lifetime_sales=float(profile.lifetime_sales)
        ),
        is_new=is_new
    )


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    user_profile: tuple[ClerkUser, Profile] = Depends(get_current_user_with_profile)
):
    """Get current user's profile."""
    user, profile = user_profile
    
    return ProfileResponse(
        id=profile.id,
        username=profile.username,
        email=profile.email,
        full_name=profile.full_name,
        avatar_url=profile.avatar_url,
        bio=profile.bio,
        website=profile.website,
        role=profile.role.value,
        lifetime_sales=float(profile.lifetime_sales)
    )


@router.patch("/me", response_model=ProfileResponse)
async def update_my_profile(
    update_data: ProfileUpdate,
    user_profile: tuple[ClerkUser, Profile] = Depends(get_current_user_with_profile),
    db: AsyncSession = Depends(get_db)
):
    """Update current user's profile."""
    user, profile = user_profile
    
    auth_service = AuthService(db)
    updated_profile = await auth_service.update_profile(
        user_id=user.id,
        username=update_data.username,
        full_name=update_data.full_name,
        bio=update_data.bio,
        website=update_data.website,
        avatar_url=update_data.avatar_url
    )
    
    if not updated_profile:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    
    return ProfileResponse(
        id=updated_profile.id,
        username=updated_profile.username,
        email=updated_profile.email,
        full_name=updated_profile.full_name,
        avatar_url=updated_profile.avatar_url,
        bio=updated_profile.bio,
        website=updated_profile.website,
        role=updated_profile.role.value,
        lifetime_sales=float(updated_profile.lifetime_sales)
    )


@router.post("/me/become-seller", response_model=ProfileResponse)
async def become_seller(
    user_profile: tuple[ClerkUser, Profile] = Depends(get_current_user_with_profile),
    db: AsyncSession = Depends(get_db)
):
    """Upgrade account to seller role."""
    user, profile = user_profile
    
    if profile.role != "buyer":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already a seller or admin"
        )
    
    auth_service = AuthService(db)
    success = await auth_service.set_seller_role(user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upgrade account"
        )
    
    await db.refresh(profile)
    
    return ProfileResponse(
        id=profile.id,
        username=profile.username,
        email=profile.email,
        full_name=profile.full_name,
        avatar_url=profile.avatar_url,
        bio=profile.bio,
        website=profile.website,
        role=profile.role.value,
        lifetime_sales=float(profile.lifetime_sales)
    )
