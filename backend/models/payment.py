"""
Payment models for HEKKA MARKET

This module defines the data models used for payment processing,
including checkout requests, webhook events, and database schemas.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class PaymentStatus(str, Enum):
    """Payment status enum"""
    COMPLETED = "completed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"
    FAILED = "failed"
    PENDING = "pending"
    DISPUTED = "disputed"


class SubscriptionStatus(str, Enum):
    """Subscription status enum"""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PAST_DUE = "past_due"
    UNPAID = "unpaid"
    PAUSED = "paused"


class CheckoutRequest(BaseModel):
    """
    Request model for creating a checkout session
    """
    product_id: str = Field(..., description="ID of the product being purchased")
    product_name: str = Field(..., description="Name of the product")
    price: float = Field(..., description="Price of the product in USD")
    seller_id: str = Field(..., description="ID of the seller")
    is_subscription: bool = Field(False, description="Whether this is a subscription product")
    interval: Optional[str] = Field(None, description="Subscription interval (month, year)")
    custom_data: Optional[Dict[str, Any]] = Field(None, description="Additional data to include with the checkout")
    
    @validator('price')
    def validate_price(cls, v):
        """Validate that price is positive"""
        if v <= 0:
            raise ValueError('Price must be greater than zero')
        return v


class CheckoutResponse(BaseModel):
    """
    Response model for checkout creation
    """
    checkout_url: str = Field(..., description="URL to redirect the user to for checkout")
    checkout_id: Optional[str] = Field(None, description="ID of the checkout session")


class WebhookEvent(BaseModel):
    """
    Model for Lemon Squeezy webhook events
    """
    meta: Dict[str, Any] = Field(..., description="Metadata about the webhook event")
    data: Dict[str, Any] = Field(..., description="Data payload of the webhook event")


class Purchase(BaseModel):
    """
    Model for a purchase record
    """
    id: Optional[str] = Field(None, description="UUID of the purchase")
    product_id: str = Field(..., description="ID of the purchased product")
    buyer_id: str = Field(..., description="ID of the buyer")
    seller_id: str = Field(..., description="ID of the seller")
    transaction_id: str = Field(..., description="Transaction ID from payment processor")
    order_id: str = Field(..., description="Order ID from payment processor")
    amount: float = Field(..., description="Total amount of the purchase")
    currency: str = Field("USD", description="Currency of the purchase")
    platform_fee: float = Field(..., description="Platform fee amount")
    processing_fee: float = Field(..., description="Payment processing fee amount")
    seller_payout: float = Field(..., description="Amount paid to seller")
    status: PaymentStatus = Field(PaymentStatus.COMPLETED, description="Status of the purchase")
    refunded_at: Optional[datetime] = Field(None, description="When the purchase was refunded")
    created_at: Optional[datetime] = Field(None, description="When the purchase was created")


class Subscription(BaseModel):
    """
    Model for a subscription record
    """
    id: Optional[str] = Field(None, description="UUID of the subscription")
    subscription_id: str = Field(..., description="Subscription ID from payment processor")
    product_id: str = Field(..., description="ID of the subscribed product")
    buyer_id: str = Field(..., description="ID of the buyer")
    seller_id: str = Field(..., description="ID of the seller")
    status: SubscriptionStatus = Field(..., description="Status of the subscription")
    renews_at: Optional[datetime] = Field(None, description="When the subscription renews")
    ends_at: Optional[datetime] = Field(None, description="When the subscription ends")
    cancelled_at: Optional[datetime] = Field(None, description="When the subscription was cancelled")
    created_at: Optional[datetime] = Field(None, description="When the subscription was created")


class SubscriptionPayment(BaseModel):
    """
    Model for a subscription payment record
    """
    id: Optional[str] = Field(None, description="UUID of the payment")
    subscription_id: str = Field(..., description="ID of the subscription")
    order_id: Optional[str] = Field(None, description="Order ID from payment processor")
    product_id: str = Field(..., description="ID of the product")
    buyer_id: str = Field(..., description="ID of the buyer")
    seller_id: str = Field(..., description="ID of the seller")
    amount: Optional[float] = Field(None, description="Amount of the payment")
    platform_fee: Optional[float] = Field(None, description="Platform fee amount")
    processing_fee: Optional[float] = Field(None, description="Payment processing fee amount")
    seller_payout: Optional[float] = Field(None, description="Amount paid to seller")
    status: PaymentStatus = Field(..., description="Status of the payment")
    created_at: Optional[datetime] = Field(None, description="When the payment was created")


class PayoutRequest(BaseModel):
    """
    Request model for initiating a payout
    """
    amount: float = Field(..., description="Amount to withdraw")
    payout_method: str = Field(..., description="Method for payout (bank_transfer, paypal)")
    
    @validator('amount')
    def validate_amount(cls, v):
        """Validate that amount is positive"""
        if v <= 0:
            raise ValueError('Amount must be greater than zero')
        return v


class PayoutResponse(BaseModel):
    """
    Response model for payout requests
    """
    payout_id: str = Field(..., description="ID of the payout")
    amount: float = Field(..., description="Amount of the payout")
    fee: float = Field(..., description="Fee for the payout")
    net_amount: float = Field(..., description="Net amount after fees")
    estimated_arrival: str = Field(..., description="Estimated arrival date")
    status: str = Field(..., description="Status of the payout")


class SalesReportRequest(BaseModel):
    """
    Request model for generating a sales report
    """
    start_date: datetime = Field(..., description="Start date for the report")
    end_date: datetime = Field(..., description="End date for the report")
    include_refunds: bool = Field(True, description="Whether to include refunded transactions")
    format: str = Field("csv", description="Report format (csv, json, pdf)")
    
    @validator('end_date')
    def validate_date_range(cls, v, values):
        """Validate that end_date is after start_date"""
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('End date must be after start date')
        return v


class TransactionSummary(BaseModel):
    """
    Summary of transactions for reporting
    """
    total_sales: float = Field(..., description="Total sales amount")
    total_transactions: int = Field(..., description="Number of transactions")
    average_order_value: float = Field(..., description="Average order value")
    platform_fees: float = Field(..., description="Total platform fees")
    processing_fees: float = Field(..., description="Total processing fees")
    net_earnings: float = Field(..., description="Net earnings after fees")
    refunded_amount: float = Field(0, description="Total refunded amount")
    refund_rate: float = Field(0, description="Refund rate percentage")
    transactions: List[Purchase] = Field([], description="List of transactions")
