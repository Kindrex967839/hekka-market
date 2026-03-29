"""
Security utilities for JWT validation.
Validates Clerk JWT tokens for authentication.
"""
import httpx
import logging
from typing import Optional
from datetime import datetime
from functools import lru_cache
from jose import jwt, jwk
from jose.utils import base64url_decode
from pydantic import BaseModel

from .config import settings

logger = logging.getLogger(__name__)


class ClerkUser(BaseModel):
    """Clerk user data from JWT token."""
    id: str
    email: str
    email_verified: bool = False
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    image_url: Optional[str] = None
    
    @property
    def full_name(self) -> Optional[str]:
        """Get full name from first and last name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name or self.last_name


# Cache JWKS keys
_jwks_cache: dict = {}
_jwks_last_fetch: Optional[datetime] = None
_JWKS_CACHE_TTL_SECONDS = 3600  # 1 hour


async def get_jwks_keys() -> dict:
    """
    Fetch JWKS keys from Clerk.
    Caches keys to avoid repeated requests.
    """
    global _jwks_cache, _jwks_last_fetch
    
    # Return cached keys if still valid
    if _jwks_cache and _jwks_last_fetch:
        elapsed = (datetime.utcnow() - _jwks_last_fetch).total_seconds()
        if elapsed < _JWKS_CACHE_TTL_SECONDS:
            return _jwks_cache
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(settings.clerk_jwks_url)
            response.raise_for_status()
            jwks_data = response.json()
            
            # Convert to dict for easy lookup by kid
            _jwks_cache = {key["kid"]: key for key in jwks_data.get("keys", [])}
            _jwks_last_fetch = datetime.utcnow()
            
            logger.info(f"Fetched {len(_jwks_cache)} JWKS keys")
            return _jwks_cache
            
    except Exception as e:
        logger.error(f"Failed to fetch JWKS keys: {e}")
        if _jwks_cache:
            logger.warning("Using cached JWKS keys")
            return _jwks_cache
        raise


async def verify_jwt_token(token: str) -> Optional[ClerkUser]:
    """
    Verify a Clerk JWT token.
    
    Args:
        token: The JWT token to verify
        
    Returns:
        ClerkUser if valid, None if invalid
    """
    try:
        # Get token header to find the key ID
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        
        if not kid:
            logger.warning("Token missing kid header")
            return None
        
        # Get the signing key
        jwks_keys = await get_jwks_keys()
        signing_key = jwks_keys.get(kid)
        
        if not signing_key:
            logger.warning(f"No matching key found for kid: {kid}")
            return None
        
        # Convert JWK to RSA key
        public_key = jwk.construct(signing_key)
        
        # Verify signature
        message, encoded_signature = token.rsplit(".", 1)
        decoded_signature = base64url_decode(encoded_signature.encode())
        
        if not public_key.verify(message.encode(), decoded_signature):
            logger.warning("Token signature verification failed")
            return None
        
        # Decode and validate claims
        payload = jwt.decode(
            token,
            public_key.to_pem().decode(),
            algorithms=["RS256"],
            options={"verify_aud": False}  # Clerk doesn't use standard aud
        )
        
        # Extract user info
        user = ClerkUser(
            id=payload.get("sub", ""),
            email=payload.get("email", ""),
            email_verified=payload.get("email_verified", False),
            first_name=payload.get("given_name"),
            last_name=payload.get("family_name"),
            username=payload.get("preferred_username"),
            image_url=payload.get("picture")
        )
        
        return user
        
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        return None
    except jwt.JWTError as e:
        logger.warning(f"JWT validation error: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error verifying token: {e}")
        return None


def extract_bearer_token(authorization: Optional[str]) -> Optional[str]:
    """
    Extract Bearer token from Authorization header.
    
    Args:
        authorization: Authorization header value
        
    Returns:
        Token string or None
    """
    if not authorization:
        return None
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    
    return parts[1]
