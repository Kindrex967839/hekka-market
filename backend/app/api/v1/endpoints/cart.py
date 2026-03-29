"""
Cart API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, Field
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...core.security import ClerkUser
from ..deps import get_current_user_optional, get_current_user
from ...services.cart_service import CartService

router = APIRouter()


class AddToCartRequest(BaseModel):
    """Request to add item to cart."""
    product_id: str
    quantity: int = Field(1, ge=1)


class UpdateQuantityRequest(BaseModel):
    """Request to update item quantity."""
    quantity: int = Field(..., ge=0)


class CartItemResponse(BaseModel):
    """Cart item response."""
    id: str
    product_id: str
    product_title: str
    product_image: Optional[str]
    price: str
    quantity: int
    subtotal: str


class CartSummaryResponse(BaseModel):
    """Cart summary response."""
    cart_id: str
    items: List[CartItemResponse]
    item_count: int
    total_quantity: int
    subtotal: str
    currency: str


@router.get("", response_model=CartSummaryResponse)
async def get_cart(
    authorization: Optional[str] = Header(None),
    x_session_id: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user's cart or guest cart.
    
    For authenticated users: use Bearer token
    For guests: use X-Session-ID header
    """
    cart_service = CartService(db)
    
    user_id = None
    session_id = x_session_id
    
    # Try to get user from token
    if authorization:
        from ...core.security import verify_jwt_token, extract_bearer_token
        token = extract_bearer_token(authorization)
        if token:
            user = await verify_jwt_token(token)
            if user:
                user_id = user.id
    
    if not user_id and not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either Authorization header or X-Session-ID"
        )
    
    cart = await cart_service.get_or_create_cart(user_id=user_id, session_id=session_id)
    summary = await cart_service.get_cart_summary(cart.id)
    
    return CartSummaryResponse(**summary)


@router.post("/items", response_model=CartItemResponse)
async def add_to_cart(
    request: AddToCartRequest,
    authorization: Optional[str] = Header(None),
    x_session_id: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """Add item to cart."""
    cart_service = CartService(db)
    
    user_id = None
    session_id = x_session_id
    
    if authorization:
        from ...core.security import verify_jwt_token, extract_bearer_token
        token = extract_bearer_token(authorization)
        if token:
            user = await verify_jwt_token(token)
            if user:
                user_id = user.id
    
    if not user_id and not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either Authorization header or X-Session-ID"
        )
    
    cart = await cart_service.get_or_create_cart(user_id=user_id, session_id=session_id)
    
    try:
        item = await cart_service.add_to_cart(
            cart_id=cart.id,
            product_id=request.product_id,
            quantity=request.quantity
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    summary = await cart_service.get_cart_summary(cart.id)
    item_data = next((i for i in summary["items"] if i["id"] == item.id), None)
    
    if not item_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve added item"
        )
    
    return CartItemResponse(**item_data)


@router.patch("/items/{item_id}", response_model=CartItemResponse)
async def update_item_quantity(
    item_id: str,
    request: UpdateQuantityRequest,
    authorization: Optional[str] = Header(None),
    x_session_id: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """Update cart item quantity. Set to 0 to remove."""
    cart_service = CartService(db)
    
    user_id = None
    session_id = x_session_id
    
    if authorization:
        from ...core.security import verify_jwt_token, extract_bearer_token
        token = extract_bearer_token(authorization)
        if token:
            user = await verify_jwt_token(token)
            if user:
                user_id = user.id
    
    if not user_id and not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either Authorization header or X-Session-ID"
        )
    
    cart = await cart_service.get_or_create_cart(user_id=user_id, session_id=session_id)
    
    item = await cart_service.update_quantity(
        cart_id=cart.id,
        item_id=item_id,
        quantity=request.quantity
    )
    
    if request.quantity == 0:
        return CartItemResponse(
            id=item_id,
            product_id="",
            product_title="",
            product_image=None,
            price="0",
            quantity=0,
            subtotal="0"
        )
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    summary = await cart_service.get_cart_summary(cart.id)
    item_data = next((i for i in summary["items"] if i["id"] == item.id), None)
    
    if not item_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve updated item"
        )
    
    return CartItemResponse(**item_data)


@router.delete("/items/{item_id}")
async def remove_item(
    item_id: str,
    authorization: Optional[str] = Header(None),
    x_session_id: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """Remove item from cart."""
    cart_service = CartService(db)
    
    user_id = None
    session_id = x_session_id
    
    if authorization:
        from ...core.security import verify_jwt_token, extract_bearer_token
        token = extract_bearer_token(authorization)
        if token:
            user = await verify_jwt_token(token)
            if user:
                user_id = user.id
    
    if not user_id and not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either Authorization header or X-Session-ID"
        )
    
    cart = await cart_service.get_or_create_cart(user_id=user_id, session_id=session_id)
    
    success = await cart_service.remove_item(cart_id=cart.id, item_id=item_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    return {"message": "Item removed"}


@router.delete("")
async def clear_cart(
    authorization: Optional[str] = Header(None),
    x_session_id: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """Clear all items from cart."""
    cart_service = CartService(db)
    
    user_id = None
    session_id = x_session_id
    
    if authorization:
        from ...core.security import verify_jwt_token, extract_bearer_token
        token = extract_bearer_token(authorization)
        if token:
            user = await verify_jwt_token(token)
            if user:
                user_id = user.id
    
    if not user_id and not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either Authorization header or X-Session-ID"
        )
    
    cart = await cart_service.get_or_create_cart(user_id=user_id, session_id=session_id)
    await cart_service.clear_cart(cart.id)
    
    return {"message": "Cart cleared"}


@router.post("/merge")
async def merge_guest_cart(
    user = Depends(get_current_user),
    x_session_id: str = Header(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Merge guest cart into user cart.
    Called after login to preserve guest cart items.
    """
    cart_service = CartService(db)
    
    merged_cart = await cart_service.merge_guest_cart(
        user_id=user.id,
        session_id=x_session_id
    )
    
    summary = await cart_service.get_cart_summary(merged_cart.id)
    
    return {
        "message": "Cart merged successfully",
        "cart": summary
    }
