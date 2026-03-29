"""
User and Profile models.
Profile stores additional user data synced from Clerk.
"""
from typing import Optional
from sqlalchemy import String, Text, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from .base import Base, TimestampMixin


class UserRole(str, enum.Enum):
    """User roles for authorization."""
    BUYER = "buyer"
    SELLER = "seller"
    ADMIN = "admin"


class Profile(Base, TimestampMixin):
    """
    User profile synced from Clerk.
    The ID is the Clerk user ID (text, not UUID).
    """
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    avatar_url: Mapped[Optional[str]] = mapped_column(Text)
    bio: Mapped[Optional[str]] = mapped_column(Text)
    website: Mapped[Optional[str]] = mapped_column(String(500))
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole),
        default=UserRole.BUYER,
        nullable=False
    )
    lifetime_sales: Mapped[float] = mapped_column(default=0.0)

    # Relationships
    products = relationship("Product", back_populates="seller", lazy="dynamic")
    purchases = relationship("Purchase", back_populates="buyer", lazy="dynamic")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.recipient_id", back_populates="recipient")

    def __repr__(self) -> str:
        return f"<Profile(id={self.id}, username={self.username})>"
