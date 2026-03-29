"""
Tests for CartService.
"""
import pytest
import pytest_asyncio
import uuid
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from conftest import Profile, Product, Category, Cart, CartItem, UserRole, ProductStatus


# Simplified CartService for testing
class CartService:
    """Service for cart operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_cart(self, user_id: str = None, session_id: str = None) -> Cart:
        """Get existing cart or create new one."""
        cart = None
        
        if user_id:
            stmt = select(Cart).where(Cart.user_id == user_id, Cart.is_active == True)
            result = await self.db.execute(stmt)
            cart = result.scalar_one_or_none()
        elif session_id:
            stmt = select(Cart).where(Cart.session_id == session_id, Cart.is_active == True)
            result = await self.db.execute(stmt)
            cart = result.scalar_one_or_none()
        
        if not cart:
            cart = Cart(
                id=str(uuid.uuid4()),
                user_id=user_id,
                session_id=session_id,
                is_active=True
            )
            self.db.add(cart)
            await self.db.commit()
            await self.db.refresh(cart)
        
        return cart

    async def add_to_cart(self, cart_id: str, product_id: str, quantity: int = 1) -> CartItem:
        """Add product to cart."""
        # Verify product exists and is published
        stmt = select(Product).where(Product.id == product_id, Product.status == "published")
        result = await self.db.execute(stmt)
        product = result.scalar_one_or_none()
        
        if not product:
            raise ValueError(f"Product not found or not available: {product_id}")
        
        # Check if item already in cart
        stmt = select(CartItem).where(CartItem.cart_id == cart_id, CartItem.product_id == product_id)
        result = await self.db.execute(stmt)
        existing_item = result.scalar_one_or_none()
        
        if existing_item:
            existing_item.quantity += quantity
            await self.db.commit()
            await self.db.refresh(existing_item)
            return existing_item
        
        # Create new cart item
        cart_item = CartItem(
            id=str(uuid.uuid4()),
            cart_id=cart_id,
            product_id=product_id,
            quantity=quantity,
            price_at_add=product.price
        )
        self.db.add(cart_item)
        await self.db.commit()
        await self.db.refresh(cart_item)
        return cart_item

    async def update_quantity(self, cart_id: str, item_id: str, quantity: int) -> CartItem:
        """Update item quantity."""
        stmt = select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart_id)
        result = await self.db.execute(stmt)
        item = result.scalar_one_or_none()
        
        if not item:
            return None
        
        if quantity <= 0:
            await self.db.delete(item)
            await self.db.commit()
            return None
        
        item.quantity = quantity
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def remove_item(self, cart_id: str, item_id: str) -> bool:
        """Remove item from cart."""
        stmt = select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart_id)
        result = await self.db.execute(stmt)
        item = result.scalar_one_or_none()
        
        if not item:
            return False
        
        await self.db.delete(item)
        await self.db.commit()
        return True

    async def clear_cart(self, cart_id: str) -> None:
        """Remove all items from cart."""
        stmt = select(CartItem).where(CartItem.cart_id == cart_id)
        result = await self.db.execute(stmt)
        items = result.scalars().all()
        
        for item in items:
            await self.db.delete(item)
        
        await self.db.commit()

    async def get_cart_summary(self, cart_id: str) -> dict:
        """Get cart summary with totals."""
        stmt = select(CartItem).where(CartItem.cart_id == cart_id)
        result = await self.db.execute(stmt)
        items = result.scalars().all()
        
        items_data = []
        subtotal = Decimal("0")
        
        for item in items:
            item_subtotal = item.price_at_add * item.quantity
            subtotal += item_subtotal
            items_data.append({
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": str(item.price_at_add),
                "subtotal": str(item_subtotal)
            })
        
        return {
            "cart_id": cart_id,
            "items": items_data,
            "item_count": len(items_data),
            "total_quantity": sum(i["quantity"] for i in items_data),
            "subtotal": str(subtotal)
        }


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> Profile:
    """Create a test user."""
    user = Profile(
        id=f"user_{uuid.uuid4().hex[:8]}",
        username="buyer",
        email="buyer@example.com",
        role=UserRole.BUYER
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_product(db_session: AsyncSession) -> Product:
    """Create a test product."""
    # Create category
    category = Category(
        id=str(uuid.uuid4()),
        name="Test Category",
        slug="test-category"
    )
    db_session.add(category)
    await db_session.flush()
    
    # Create product
    product = Product(
        id=str(uuid.uuid4()),
        title="Test Product",
        description="A test product",
        price=Decimal("9.99"),
        category_id=category.id,
        seller_id="seller123",
        status="published"
    )
    db_session.add(product)
    await db_session.commit()
    await db_session.refresh(product)
    return product


@pytest.mark.asyncio
class TestCartService:
    """Test CartService methods."""

    async def test_get_or_create_cart_user(self, db_session: AsyncSession, test_user: Profile):
        """Test creating cart for authenticated user."""
        cart_service = CartService(db_session)
        
        cart = await cart_service.get_or_create_cart(user_id=test_user.id)
        
        assert cart is not None
        assert cart.user_id == test_user.id
        assert cart.is_active is True

    async def test_get_or_create_cart_guest(self, db_session: AsyncSession):
        """Test creating cart for guest user."""
        cart_service = CartService(db_session)
        
        session_id = "session_abc123"
        cart = await cart_service.get_or_create_cart(session_id=session_id)
        
        assert cart is not None
        assert cart.session_id == session_id
        assert cart.is_active is True

    async def test_add_to_cart(self, db_session: AsyncSession, test_user: Profile, test_product: Product):
        """Test adding product to cart."""
        cart_service = CartService(db_session)
        
        # Create cart
        cart = await cart_service.get_or_create_cart(user_id=test_user.id)
        
        # Add item
        item = await cart_service.add_to_cart(
            cart_id=cart.id,
            product_id=test_product.id,
            quantity=1
        )
        
        assert item is not None
        assert item.product_id == test_product.id
        assert item.quantity == 1
        assert item.price_at_add == test_product.price

    async def test_add_to_cart_updates_quantity(self, db_session: AsyncSession, test_user: Profile, test_product: Product):
        """Test adding same product updates quantity."""
        cart_service = CartService(db_session)
        
        cart = await cart_service.get_or_create_cart(user_id=test_user.id)
        
        # Add item first time
        item1 = await cart_service.add_to_cart(cart_id=cart.id, product_id=test_product.id, quantity=1)
        
        # Add same item again
        item2 = await cart_service.add_to_cart(cart_id=cart.id, product_id=test_product.id, quantity=2)
        
        assert item1.id == item2.id
        assert item2.quantity == 3  # 1 + 2

    async def test_add_to_cart_unpublished_product_fails(self, db_session: AsyncSession, test_user: Profile):
        """Test adding unpublished product fails."""
        cart_service = CartService(db_session)
        
        # Create unpublished product
        category = Category(id=str(uuid.uuid4()), name="Cat", slug="cat")
        db_session.add(category)
        await db_session.flush()
        
        product = Product(
            id=str(uuid.uuid4()),
            title="Draft Product",
            description="Draft",
            price=Decimal("9.99"),
            category_id=category.id,
            seller_id="seller123",
            status="draft"  # Not published
        )
        db_session.add(product)
        await db_session.commit()
        
        cart = await cart_service.get_or_create_cart(user_id=test_user.id)
        
        with pytest.raises(ValueError, match="not found or not available"):
            await cart_service.add_to_cart(cart_id=cart.id, product_id=product.id)

    async def test_update_quantity(self, db_session: AsyncSession, test_user: Profile, test_product: Product):
        """Test updating cart item quantity."""
        cart_service = CartService(db_session)
        
        cart = await cart_service.get_or_create_cart(user_id=test_user.id)
        item = await cart_service.add_to_cart(cart_id=cart.id, product_id=test_product.id, quantity=1)
        
        # Update quantity
        updated = await cart_service.update_quantity(cart_id=cart.id, item_id=item.id, quantity=5)
        
        assert updated.quantity == 5

    async def test_update_quantity_zero_removes_item(self, db_session: AsyncSession, test_user: Profile, test_product: Product):
        """Test setting quantity to 0 removes item."""
        cart_service = CartService(db_session)
        
        cart = await cart_service.get_or_create_cart(user_id=test_user.id)
        item = await cart_service.add_to_cart(cart_id=cart.id, product_id=test_product.id, quantity=1)
        
        # Set quantity to 0
        result = await cart_service.update_quantity(cart_id=cart.id, item_id=item.id, quantity=0)
        
        assert result is None  # Item removed

    async def test_remove_item(self, db_session: AsyncSession, test_user: Profile, test_product: Product):
        """Test removing item from cart."""
        cart_service = CartService(db_session)
        
        cart = await cart_service.get_or_create_cart(user_id=test_user.id)
        item = await cart_service.add_to_cart(cart_id=cart.id, product_id=test_product.id)
        
        # Remove item
        success = await cart_service.remove_item(cart_id=cart.id, item_id=item.id)
        assert success is True

    async def test_clear_cart(self, db_session: AsyncSession, test_user: Profile, test_product: Product):
        """Test clearing all items from cart."""
        cart_service = CartService(db_session)
        
        cart = await cart_service.get_or_create_cart(user_id=test_user.id)
        await cart_service.add_to_cart(cart_id=cart.id, product_id=test_product.id)
        
        # Clear cart
        await cart_service.clear_cart(cart.id)
        
        # Verify empty
        summary = await cart_service.get_cart_summary(cart.id)
        assert summary["item_count"] == 0

    async def test_get_cart_summary(self, db_session: AsyncSession, test_user: Profile, test_product: Product):
        """Test getting cart summary with totals."""
        cart_service = CartService(db_session)
        
        cart = await cart_service.get_or_create_cart(user_id=test_user.id)
        await cart_service.add_to_cart(cart_id=cart.id, product_id=test_product.id, quantity=2)
        
        summary = await cart_service.get_cart_summary(cart.id)
        
        assert summary["item_count"] == 1
        assert summary["total_quantity"] == 2
        expected_subtotal = str(test_product.price * 2)
        assert summary["subtotal"] == expected_subtotal
