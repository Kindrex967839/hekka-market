"""
Product and related models.
"""
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Text, Numeric, Boolean, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from .base import Base, TimestampMixin


class ProductStatus(str, enum.Enum):
    """Product publication status."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ProductType(str, enum.Enum):
    """Product type for pricing model."""
    DIGITAL_DOWNLOAD = "digital_download"
    SUBSCRIPTION = "subscription"


class Category(Base, TimestampMixin):
    """Product category."""
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # UUID as string
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    slug: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True)

    # Relationships
    products = relationship("Product", back_populates="category", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<Category(id={self.id}, name={self.name})>"


class Product(Base, TimestampMixin):
    """Digital product listing."""
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # UUID as string
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    
    # Foreign keys
    category_id: Mapped[Optional[str]] = mapped_column(
        String(36), 
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True
    )
    seller_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Status and type
    status: Mapped[ProductStatus] = mapped_column(
        SQLEnum(ProductStatus),
        default=ProductStatus.DRAFT,
        nullable=False,
        index=True
    )
    product_type: Mapped[ProductType] = mapped_column(
        SQLEnum(ProductType),
        default=ProductType.DIGITAL_DOWNLOAD,
        nullable=False
    )
    
    # Main image URL
    image_url: Mapped[Optional[str]] = mapped_column(Text)
    
    # Stats
    sales_count: Mapped[int] = mapped_column(Integer, default=0)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Lemon Squeezy integration
    lemon_squeezy_product_id: Mapped[Optional[str]] = mapped_column(String(255))
    lemon_squeezy_url: Mapped[Optional[str]] = mapped_column(Text)
    
    # Search vector (for full-text search)
    # search_vector: Mapped[Optional[str]] = mapped_column(Text)  # Added via migration

    # Relationships
    category = relationship("Category", back_populates="products")
    seller = relationship("Profile", back_populates="products")
    images = relationship("ProductImage", back_populates="product", lazy="dynamic", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product", lazy="dynamic")

    @property
    def is_published(self) -> bool:
        return self.status == ProductStatus.PUBLISHED

    def __repr__(self) -> str:
        return f"<Product(id={self.id}, title={self.title})>"


class ProductImage(Base, TimestampMixin):
    """Additional product images."""
    __tablename__ = "product_images"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    product_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    storage_path: Mapped[str] = mapped_column(Text, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationship
    product = relationship("Product", back_populates="images")

    def __repr__(self) -> str:
        return f"<ProductImage(id={self.id}, product_id={self.product_id})>"
