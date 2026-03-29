"""
Analytics and event tracking models.
"""
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class AnalyticsEvent(Base):
    """Analytics event for tracking user behavior."""
    __tablename__ = "analytics_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    
    # Event identification
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True
    )
    
    # Actor (user who triggered event)
    user_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        ForeignKey("profiles.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    session_id: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    
    # Context
    product_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    seller_id: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    
    # Event data
    metadata: Mapped[Optional[dict]] = mapped_column(JSON)
    
    # Request context
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))  # IPv6 compatible
    user_agent: Mapped[Optional[str]] = mapped_column(Text)
    referrer: Mapped[Optional[str]] = mapped_column(Text)

    def __repr__(self) -> str:
        return f"<AnalyticsEvent(id={self.id}, type={self.event_type})>"


class DailyAnalytics(Base):
    """Pre-aggregated daily analytics for performance."""
    __tablename__ = "daily_analytics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    
    # Scope
    seller_id: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    product_id: Mapped[Optional[str]] = mapped_column(String(36), index=True)
    
    # Metrics
    page_views: Mapped[int] = mapped_column(default=0)
    unique_visitors: Mapped[int] = mapped_column(default=0)
    add_to_cart: Mapped[int] = mapped_column(default=0)
    purchases: Mapped[int] = mapped_column(default=0)
    revenue: Mapped[float] = mapped_column(default=0.0)
    refund_count: Mapped[int] = mapped_column(default=0)
    refund_amount: Mapped[float] = mapped_column(default=0.0)
    
    # Calculated
    conversion_rate: Mapped[Optional[float]] = mapped_column()
    avg_order_value: Mapped[Optional[float]] = mapped_column()

    def __repr__(self) -> str:
        return f"<DailyAnalytics(date={self.date})>"
