from fastapi import Depends, HTTPException, status
from databutton_app.mw.auth_mw import get_authorized_user, User

async def get_current_user(user: User = Depends(get_authorized_user)) -> User:
    """
    Dependency to get the currently authenticated user.
    Uses the databutton auth middleware.
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
