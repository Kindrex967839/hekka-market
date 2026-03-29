"""
Shopping cart models.
"""
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Numeric, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class Cart(Base, TimestampMixin):
    """Shopping cart for users and guests."""
    __tablename__ = "carts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    
    # User cart (authenticated)
    user_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    
    # Guest cart (session-based)
    session_id: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    
    # Status
    is_active: Mapped[bool] = mapped_column(default=True, index=True)

    # Relationships
    user = relationship("Profile", back_populates="carts")
    items = relationship("CartItem", back_populates="cart", lazy="dynamic", cascade="all, delete-orphan")

    @property
    def total(self) -> Decimal:
        """Calculate cart total."""
        # This would be computed in a query for efficiency
        return sum(item.subtotal for item in self.items)

    def __repr__(self) -> str:
        return f"<Cart(id={self.id}, user_id={self.user_id})>"


class CartItem(Base, TimestampMixin):
    """Item in a shopping cart."""
    __tablename__ = "cart_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    cart_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("carts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    product_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    price_at_add: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)  # Price when added

    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")

    @property
    def subtotal(self) -> Decimal:
        """Calculate item subtotal."""
        return self.price_at_add * self.quantity

    def __repr__(self) -> str:
        return f"<CartItem(id={self.id}, product_id={self.product_id})>"
