"""
Purchase and payment models.
"""
from typing import Optional
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Numeric, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from .base import Base, TimestampMixin


class PurchaseStatus(str, enum.Enum):
    """Purchase status."""
    COMPLETED = "completed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"
    FAILED = "failed"
    DISPUTED = "disputed"


class Purchase(Base, TimestampMixin):
    """Completed purchase record."""
    __tablename__ = "purchases"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    
    # Product purchased
    product_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,  # Allow NULL if product deleted
        index=True
    )
    
    # Participants
    buyer_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("profiles.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    seller_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("profiles.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Transaction IDs from Lemon Squeezy
    transaction_id: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    order_id: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Financials
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    platform_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    processing_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    seller_payout: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    
    # Status
    status: Mapped[PurchaseStatus] = mapped_column(
        SQLEnum(PurchaseStatus),
        default=PurchaseStatus.COMPLETED,
        nullable=False,
        index=True
    )
    
    # Refund info
    refunded_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    refund_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    
    # Custom data from checkout
    custom_data: Mapped[Optional[dict]] = mapped_column()  # JSON

    # Relationships
    product = relationship("Product")
    buyer = relationship("Profile", foreign_keys=[buyer_id], back_populates="purchases")
    seller = relationship("Profile", foreign_keys=[seller_id])

    def __repr__(self) -> str:
        return f"<Purchase(id={self.id}, status={self.status})>"


class Subscription(Base, TimestampMixin):
    """Subscription record."""
    __tablename__ = "subscriptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    subscription_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    
    # Product subscribed to
    product_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Participants
    buyer_id: Mapped[str] = mapped_column(String(255), index=True)
    seller_id: Mapped[str] = mapped_column(String(255), index=True)
    
    # Subscription details
    status: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    renews_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Relationships
    product = relationship("Product")
    payments = relationship("SubscriptionPayment", back_populates="subscription")

    def __repr__(self) -> str:
        return f"<Subscription(id={self.id}, status={self.status})>"


class SubscriptionPayment(Base, TimestampMixin):
    """Payment for a subscription."""
    __tablename__ = "subscription_payments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    subscription_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("subscriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    order_id: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Amounts
    amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    platform_fee: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    processing_fee: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    seller_payout: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    
    status: Mapped[str] = mapped_column(String(50), nullable=False)

    # Relationships
    subscription = relationship("Subscription", back_populates="payments")

    def __repr__(self) -> str:
        return f"<SubscriptionPayment(id={self.id})>"


class Notification(Base, TimestampMixin):
    """User notification."""
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    data: Mapped[Optional[dict]] = mapped_column()  # JSON
    
    read: Mapped[bool] = mapped_column(default=False, index=True)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, type={self.type})>"
