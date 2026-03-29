"""
Cart service for shopping cart operations.
"""
import logging
from typing import Optional, List
from decimal import Decimal
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import Cart, CartItem, Product, Profile, ProductStatus

logger = logging.getLogger(__name__)


class CartService:
    """Service for cart operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_cart(
        self,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> Cart:
        """
        Get existing cart or create new one.
        
        Args:
            user_id: User ID for authenticated users
            session_id: Session ID for guest users
            
        Returns:
            Cart instance
        """
        cart = None
        
        if user_id:
            # Get user's active cart
            stmt = select(Cart).where(
                Cart.user_id == user_id,
                Cart.is_active == True
            )
            result = await self.db.execute(stmt)
            cart = result.scalar_one_or_none()
        elif session_id:
            # Get guest cart
            stmt = select(Cart).where(
                Cart.session_id == session_id,
                Cart.is_active == True
            )
            result = await self.db.execute(stmt)
            cart = result.scalar_one_or_none()
        
        if not cart:
            # Create new cart
            import uuid
            cart = Cart(
                id=str(uuid.uuid4()),
                user_id=user_id,
                session_id=session_id,
                is_active=True
            )
            self.db.add(cart)
            await self.db.commit()
            await self.db.refresh(cart)
            logger.info(f"Created new cart: {cart.id}")
        
        return cart

    async def get_cart_with_items(self, cart_id: str) -> Optional[Cart]:
        """Get cart with all items loaded."""
        stmt = select(Cart).options(
            selectinload(Cart.items).selectinload(CartItem.product)
        ).where(Cart.id == cart_id)
        
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def add_to_cart(
        self,
        cart_id: str,
        product_id: str,
        quantity: int = 1
    ) -> CartItem:
        """
        Add product to cart.
        
        Args:
            cart_id: Cart ID
            product_id: Product ID
            quantity: Quantity to add
            
        Returns:
            CartItem instance
            
        Raises:
            ValueError: If product not found or not published
        """
        # Verify product exists and is published
        stmt = select(Product).where(
            Product.id == product_id,
            Product.status == ProductStatus.PUBLISHED
        )
        result = await self.db.execute(stmt)
        product = result.scalar_one_or_none()
        
        if not product:
            raise ValueError(f"Product not found or not available: {product_id}")
        
        # Check if item already in cart
        stmt = select(CartItem).where(
            CartItem.cart_id == cart_id,
            CartItem.product_id == product_id
        )
        result = await self.db.execute(stmt)
        existing_item = result.scalar_one_or_none()
        
        if existing_item:
            # Update quantity
            existing_item.quantity += quantity
            await self.db.commit()
            await self.db.refresh(existing_item)
            logger.info(f"Updated cart item quantity: {existing_item.id}")
            return existing_item
        
        # Create new cart item
        import uuid
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
        
        logger.info(f"Added item to cart: {cart_item.id}")
        return cart_item

    async def update_quantity(
        self,
        cart_id: str,
        item_id: str,
        quantity: int
    ) -> Optional[CartItem]:
        """
        Update item quantity.
        
        Args:
            cart_id: Cart ID
            item_id: Cart item ID
            quantity: New quantity
            
        Returns:
            Updated CartItem or None if removed
        """
        stmt = select(CartItem).where(
            CartItem.id == item_id,
            CartItem.cart_id == cart_id
        )
        result = await self.db.execute(stmt)
        item = result.scalar_one_or_none()
        
        if not item:
            return None
        
        if quantity <= 0:
            # Remove item
            await self.db.delete(item)
            await self.db.commit()
            logger.info(f"Removed item from cart: {item_id}")
            return None
        
        item.quantity = quantity
        await self.db.commit()
        await self.db.refresh(item)
        
        return item

    async def remove_item(self, cart_id: str, item_id: str) -> bool:
        """Remove item from cart."""
        stmt = select(CartItem).where(
            CartItem.id == item_id,
            CartItem.cart_id == cart_id
        )
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

    async def merge_guest_cart(
        self,
        user_id: str,
        session_id: str
    ) -> Cart:
        """
        Merge guest cart into user cart.
        Called when user logs in.
        
        Args:
            user_id: User ID
            session_id: Guest session ID
            
        Returns:
            Merged user cart
        """
        # Get guest cart
        guest_cart = await self.get_or_create_cart(session_id=session_id)
        
        # Get user cart
        user_cart = await self.get_or_create_cart(user_id=user_id)
        
        if guest_cart.id == user_cart.id:
            return user_cart
        
        # Get guest cart items
        stmt = select(CartItem).where(CartItem.cart_id == guest_cart.id)
        result = await self.db.execute(stmt)
        guest_items = result.scalars().all()
        
        # Move items to user cart
        for guest_item in guest_items:
            # Check if product already in user cart
            stmt = select(CartItem).where(
                CartItem.cart_id == user_cart.id,
                CartItem.product_id == guest_item.product_id
            )
            result = await self.db.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if existing:
                existing.quantity += guest_item.quantity
            else:
                # Move item to user cart
                guest_item.cart_id = user_cart.id
        
        # Mark guest cart as inactive
        guest_cart.is_active = False
        
        await self.db.commit()
        await self.db.refresh(user_cart)
        
        logger.info(f"Merged guest cart {guest_cart.id} into user cart {user_cart.id}")
        return user_cart

    async def get_cart_summary(self, cart_id: str) -> dict:
        """
        Get cart summary with totals.
        
        Returns:
            Dict with items, item_count, subtotal, etc.
        """
        cart = await self.get_cart_with_items(cart_id)
        
        if not cart:
            return {
                "items": [],
                "item_count": 0,
                "subtotal": "0.00",
                "currency": "USD"
            }
        
        items = []
        subtotal = Decimal("0")
        
        for item in cart.items:
            product = item.product
            item_subtotal = item.price_at_add * item.quantity
            subtotal += item_subtotal
            
            items.append({
                "id": item.id,
                "product_id": item.product_id,
                "product_title": product.title if product else "Unknown Product",
                "product_image": product.image_url if product else None,
                "price": str(item.price_at_add),
                "quantity": item.quantity,
                "subtotal": str(item_subtotal)
            })
        
        return {
            "cart_id": cart.id,
            "items": items,
            "item_count": len(items),
            "total_quantity": sum(i["quantity"] for i in items),
            "subtotal": str(subtotal),
            "currency": "USD"
        }
