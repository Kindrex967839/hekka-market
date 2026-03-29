"""
Application configuration using Pydantic Settings.
Loads from environment variables with sensible defaults.
"""
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "HEKKA MARKET"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True
    log_level: str = "DEBUG"

    # Database
    database_url: str = "postgresql+asyncpg://hekka:hekka_dev_password@localhost:5432/hekka_market"
    database_url_pooled: Optional[str] = None
    db_pool_size: int = 5
    db_max_overflow: int = 10
    db_pool_timeout: int = 30

    # Redis (optional)
    redis_url: Optional[str] = "redis://localhost:6379/0"

    # Clerk Authentication
    clerk_publishable_key: Optional[str] = None
    clerk_secret_key: Optional[str] = None
    clerk_jwks_url: str = "https://api.clerk.dev/v1/jwks"

    # Lemon Squeezy
    lemon_squeezy_api_key: Optional[str] = None
    lemon_squeezy_webhook_secret: Optional[str] = None
    lemon_squeezy_store_id: Optional[str] = None

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    @property
    def effective_database_url(self) -> str:
        """Return the appropriate database URL based on environment."""
        if self.environment == "production" and self.database_url_pooled:
            return self.database_url_pooled
        return self.database_url

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Export settings instance
settings = get_settings()
