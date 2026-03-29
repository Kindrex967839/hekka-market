"""
SQLAlchemy models for HEKKA MARKET.
Import all models here for Alembic autogenerate to work.
"""
from .base import Base, TimestampMixin
from .user import Profile, UserRole
from .product import Product, ProductImage, Category, ProductStatus, ProductType
from .cart import Cart, CartItem
from .message import Message, Conversation
from .review import Review, ReviewStatus, ReviewHelpful
from .analytics import AnalyticsEvent, DailyAnalytics
from .purchase import (
    Purchase,
    PurchaseStatus,
    Subscription,
    SubscriptionPayment,
    Notification,
)

# Export all for easy import
__all__ = [
    # Base
    "Base",
    "TimestampMixin",
    # User
    "Profile",
    "UserRole",
    # Product
    "Product",
    "ProductImage",
    "Category",
    "ProductStatus",
    "ProductType",
    # Cart
    "Cart",
    "CartItem",
    # Message
    "Message",
    "Conversation",
    # Review
    "Review",
    "ReviewStatus",
    "ReviewHelpful",
    # Analytics
    "AnalyticsEvent",
    "DailyAnalytics",
    # Purchase
    "Purchase",
    "PurchaseStatus",
    "Subscription",
    "SubscriptionPayment",
    "Notification",
]
