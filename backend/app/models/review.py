"""
Product review model.
"""
from typing import Optional
from sqlalchemy import String, Text, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from .base import Base, TimestampMixin


class ReviewStatus(str, enum.Enum):
    """Review moderation status."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Review(Base, TimestampMixin):
    """Product review from verified purchase."""
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    
    # Product being reviewed
    product_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Reviewer
    user_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Verified purchase
    purchase_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("purchases.id", ondelete="SET NULL"),
        nullable=True  # Allow NULL if purchase deleted
    )
    
    # Review content
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    title: Mapped[Optional[str]] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Moderation
    status: Mapped[ReviewStatus] = mapped_column(
        SQLEnum(ReviewStatus),
        default=ReviewStatus.PENDING,
        nullable=False,
        index=True
    )
    
    # Helpful votes
    helpful_count: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    product = relationship("Product", back_populates="reviews")
    user = relationship("Profile")
    purchase = relationship("Purchase")

    def __repr__(self) -> str:
        return f"<Review(id={self.id}, rating={self.rating})>"


class ReviewHelpful(Base):
    """Track which users marked which reviews as helpful."""
    __tablename__ = "review_helpful"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    review_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False
    )

    # Relationship
    review = relationship("Review")
