"""
Lemon Squeezy Webhook Handler for HEKKA MARKET

This module handles incoming webhooks from Lemon Squeezy payment processor.
It processes various events like order creation, refunds, and subscription management.
"""

from fastapi import APIRouter, Request, HTTPException, Header, Depends
import hmac
import hashlib
import json
import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime
from ..database import get_supabase_client
from ..models.payment import WebhookEvent
from ..utils.auth import get_current_user

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Get webhook secret from environment variables
WEBHOOK_SECRET = os.getenv("LEMON_SQUEEZY_WEBHOOK_SECRET")
if not WEBHOOK_SECRET:
    logger.warning("LEMON_SQUEEZY_WEBHOOK_SECRET not set in environment variables")

def verify_signature(payload_body: bytes, signature_header: str) -> bool:
    """
    Verify that the webhook signature is valid
    
    Args:
        payload_body: Raw request body bytes
        signature_header: Signature from X-Signature header
        
    Returns:
        bool: True if signature is valid, False otherwise
    """
    if not signature_header or not WEBHOOK_SECRET:
        return False
        
    signature = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        payload_body,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, signature_header)

@router.post("/webhooks/lemonsqueezy")
async def handle_webhook(
    request: Request,
    x_signature: Optional[str] = Header(None)
):
    """
    Handle Lemon Squeezy webhooks
    
    This endpoint receives webhook events from Lemon Squeezy and processes them
    based on the event type.
    
    Args:
        request: FastAPI request object
        x_signature: Signature header for verification
        
    Returns:
        dict: Status response
    """
    # Get the raw request body
    payload_body = await request.body()
    
    # Log the webhook receipt
    logger.info(f"Received Lemon Squeezy webhook: {len(payload_body)} bytes")
    
    # Verify webhook signature in production
    if os.getenv("ENVIRONMENT") == "production" and not verify_signature(payload_body, x_signature):
        logger.warning("Invalid webhook signature")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Parse the webhook payload
    try:
        payload = json.loads(payload_body)
    except json.JSONDecodeError:
        logger.error("Failed to parse webhook payload")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    
    # Extract event information
    event_name = payload.get("meta", {}).get("event_name")
    logger.info(f"Processing webhook event: {event_name}")
    
    # Handle different event types
    try:
        if event_name == "order_created":
            await handle_order_created(payload)
        elif event_name == "order_refunded":
            await handle_order_refunded(payload)
        elif event_name == "subscription_created":
            await handle_subscription_created(payload)
        elif event_name == "subscription_updated":
            await handle_subscription_updated(payload)
        elif event_name == "subscription_cancelled":
            await handle_subscription_cancelled(payload)
        elif event_name == "subscription_payment_success":
            await handle_subscription_payment(payload)
        elif event_name == "subscription_payment_failed":
            await handle_subscription_payment_failed(payload)
        else:
            logger.info(f"Unhandled event type: {event_name}")
    except Exception as e:
        # Log the error but return 200 to prevent Lemon Squeezy from retrying
        logger.error(f"Error processing webhook {event_name}: {str(e)}")
        return {"status": "error", "message": str(e)}
    
    return {"status": "success"}

async def handle_order_created(payload: dict):
    """
    Handle order.created webhook event
    
    This function processes a new order, records the purchase in the database,
    and updates relevant seller and product statistics.
    
    Args:
        payload: Webhook payload from Lemon Squeezy
    """
    try:
        # Extract data from payload
        order_data = payload.get("data", {})
        order_id = order_data.get("id")
        attributes = order_data.get("attributes", {})
        
        # Get custom data that was passed during checkout
        custom_data = attributes.get("custom_data", {})
        product_id = custom_data.get("product_id")
        buyer_id = custom_data.get("buyer_id")
        seller_id = custom_data.get("seller_id")
        
        # Get order details
        total = attributes.get("total")
        currency = attributes.get("currency")
        status = attributes.get("status")
        
        # Validate required data
        if not all([product_id, buyer_id, seller_id, total, order_id]):
            logger.error(f"Missing required data in order_created webhook: {custom_data}")
            return
        
        # Calculate fees
        total_amount = float(total)
        
        # Check if seller is premium (>$10,000 lifetime sales)
        supabase = get_supabase_client()
        seller_data = supabase.table("profiles").select("lifetime_sales").eq("id", seller_id).execute()
        
        lifetime_sales = 0
        if seller_data.data and len(seller_data.data) > 0:
            lifetime_sales = float(seller_data.data[0].get("lifetime_sales", 0))
        
        # Apply appropriate fee rate
        if lifetime_sales > 10000:
            # Premium seller rate
            platform_fee_rate = 0.05  # 5%
        else:
            # Standard seller rate
            platform_fee_rate = 0.08  # 8%
        
        platform_fee = total_amount * platform_fee_rate
        processing_fee = (total_amount * 0.029) + 0.30  # 2.9% + $0.30 processing fee
        seller_payout = total_amount - platform_fee - processing_fee
        
        # Format values to 2 decimal places
        platform_fee = round(platform_fee, 2)
        processing_fee = round(processing_fee, 2)
        seller_payout = round(seller_payout, 2)
        
        # Insert purchase record into database
        purchase_data = {
            "product_id": product_id,
            "buyer_id": buyer_id,
            "seller_id": seller_id,
            "transaction_id": order_id,
            "order_id": order_id,
            "amount": total_amount,
            "currency": currency,
            "platform_fee": platform_fee,
            "processing_fee": processing_fee,
            "seller_payout": seller_payout,
            "status": status.lower()
        }
        
        # Insert into purchases table
        result = supabase.table("purchases").insert(purchase_data).execute()
        
        if not result.data:
            logger.error(f"Failed to insert purchase record: {result.error}")
            return
            
        purchase_id = result.data[0]["id"]
        logger.info(f"Created purchase record: {purchase_id}")
        
        # Update seller's lifetime sales
        new_lifetime_sales = lifetime_sales + total_amount
        supabase.table("profiles").update({"lifetime_sales": new_lifetime_sales}).eq("id", seller_id).execute()
        
        # Update product sales count
        product_result = supabase.table("products").select("sales_count").eq("id", product_id).execute()
        if product_result.data and len(product_result.data) > 0:
            current_sales = int(product_result.data[0].get("sales_count", 0))
            supabase.table("products").update({"sales_count": current_sales + 1}).eq("id", product_id).execute()
        
        # Send notification to seller about the sale
        notification_data = {
            "user_id": seller_id,
            "type": "sale",
            "title": "New Sale",
            "message": f"You've sold a product for {currency} {total_amount}",
            "data": {"purchase_id": purchase_id, "product_id": product_id},
            "read": False
        }
        supabase.table("notifications").insert(notification_data).execute()
        
        logger.info(f"Successfully processed order {order_id} for product {product_id}")
            
    except Exception as e:
        logger.error(f"Error handling order_created: {str(e)}")
        raise

async def handle_order_refunded(payload: dict):
    """
    Handle order.refunded webhook event
    
    This function processes a refund, updates the purchase status,
    and adjusts seller balances accordingly.
    
    Args:
        payload: Webhook payload from Lemon Squeezy
    """
    try:
        # Extract data from payload
        order_data = payload.get("data", {})
        order_id = order_data.get("id")
        attributes = order_data.get("attributes", {})
        
        if not order_id:
            logger.error("Missing order_id in refund webhook")
            return
        
        # Get the Supabase client
        supabase = get_supabase_client()
        
        # Find the purchase record
        purchase_result = supabase.table("purchases").select("*").eq("order_id", order_id).execute()
        
        if not purchase_result.data or len(purchase_result.data) == 0:
            logger.error(f"No purchase found for order_id {order_id}")
            return
            
        purchase = purchase_result.data[0]
        purchase_id = purchase["id"]
        seller_id = purchase["seller_id"]
        amount = purchase["amount"]
        
        # Update purchase record in database
        update_data = {
            "status": "refunded",
            "refunded_at": datetime.utcnow().isoformat()
        }
        
        supabase.table("purchases").update(update_data).eq("id", purchase_id).execute()
        
        # Update seller's lifetime sales (subtract the refunded amount)
        seller_data = supabase.table("profiles").select("lifetime_sales").eq("id", seller_id).execute()
        
        if seller_data.data and len(seller_data.data) > 0:
            lifetime_sales = float(seller_data.data[0].get("lifetime_sales", 0))
            new_lifetime_sales = max(0, lifetime_sales - amount)  # Ensure it doesn't go below 0
            supabase.table("profiles").update({"lifetime_sales": new_lifetime_sales}).eq("id", seller_id).execute()
        
        # Send notification to seller about the refund
        notification_data = {
            "user_id": seller_id,
            "type": "refund",
            "title": "Refund Processed",
            "message": f"A refund has been processed for order #{order_id}",
            "data": {"purchase_id": purchase_id},
            "read": False
        }
        supabase.table("notifications").insert(notification_data).execute()
        
        logger.info(f"Successfully processed refund for order {order_id}")
            
    except Exception as e:
        logger.error(f"Error handling order_refunded: {str(e)}")
        raise

async def handle_subscription_created(payload: dict):
    """
    Handle subscription.created webhook event
    
    This function processes a new subscription and records it in the database.
    
    Args:
        payload: Webhook payload from Lemon Squeezy
    """
    try:
        # Extract subscription data
        subscription_data = payload.get("data", {})
        subscription_id = subscription_data.get("id")
        attributes = subscription_data.get("attributes", {})
        
        # Get custom data
        custom_data = attributes.get("custom_data", {})
        product_id = custom_data.get("product_id")
        buyer_id = custom_data.get("buyer_id")
        seller_id = custom_data.get("seller_id")
        
        # Get subscription details
        status = attributes.get("status")
        renews_at = attributes.get("renews_at")
        ends_at = attributes.get("ends_at")
        
        # Validate required data
        if not all([subscription_id, product_id, buyer_id, seller_id]):
            logger.error(f"Missing required data in subscription_created webhook")
            return
        
        # Insert subscription record
        supabase = get_supabase_client()
        subscription_data = {
            "subscription_id": subscription_id,
            "product_id": product_id,
            "buyer_id": buyer_id,
            "seller_id": seller_id,
            "status": status.lower(),
            "renews_at": renews_at,
            "ends_at": ends_at
        }
        
        result = supabase.table("subscriptions").insert(subscription_data).execute()
        
        if not result.data:
            logger.error(f"Failed to insert subscription record: {result.error}")
            return
            
        logger.info(f"Created subscription record for {subscription_id}")
        
    except Exception as e:
        logger.error(f"Error handling subscription_created: {str(e)}")
        raise

async def handle_subscription_updated(payload: dict):
    """
    Handle subscription.updated webhook event
    
    This function updates an existing subscription record.
    
    Args:
        payload: Webhook payload from Lemon Squeezy
    """
    try:
        # Extract subscription data
        subscription_data = payload.get("data", {})
        subscription_id = subscription_data.get("id")
        attributes = subscription_data.get("attributes", {})
        
        # Get subscription details
        status = attributes.get("status")
        renews_at = attributes.get("renews_at")
        ends_at = attributes.get("ends_at")
        
        if not subscription_id:
            logger.error("Missing subscription_id in update webhook")
            return
        
        # Update subscription record
        supabase = get_supabase_client()
        update_data = {
            "status": status.lower(),
            "renews_at": renews_at,
            "ends_at": ends_at,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        supabase.table("subscriptions").update(update_data).eq("subscription_id", subscription_id).execute()
        
        logger.info(f"Updated subscription record for {subscription_id}")
        
    except Exception as e:
        logger.error(f"Error handling subscription_updated: {str(e)}")
        raise

async def handle_subscription_cancelled(payload: dict):
    """
    Handle subscription.cancelled webhook event
    
    This function updates a subscription record to cancelled status.
    
    Args:
        payload: Webhook payload from Lemon Squeezy
    """
    try:
        # Extract subscription data
        subscription_data = payload.get("data", {})
        subscription_id = subscription_data.get("id")
        
        if not subscription_id:
            logger.error("Missing subscription_id in cancellation webhook")
            return
        
        # Update subscription record
        supabase = get_supabase_client()
        update_data = {
            "status": "cancelled",
            "cancelled_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("subscriptions").update(update_data).eq("subscription_id", subscription_id).execute()
        
        if not result.data or len(result.data) == 0:
            logger.error(f"No subscription found for id {subscription_id}")
            return
            
        subscription = result.data[0]
        seller_id = subscription["seller_id"]
        
        # Send notification to seller about the cancellation
        notification_data = {
            "user_id": seller_id,
            "type": "subscription_cancelled",
            "title": "Subscription Cancelled",
            "message": f"A subscription has been cancelled",
            "data": {"subscription_id": subscription_id},
            "read": False
        }
        supabase.table("notifications").insert(notification_data).execute()
        
        logger.info(f"Cancelled subscription record for {subscription_id}")
        
    except Exception as e:
        logger.error(f"Error handling subscription_cancelled: {str(e)}")
        raise

async def handle_subscription_payment(payload: dict):
    """
    Handle subscription.payment_success webhook event
    
    This function processes a successful subscription payment.
    
    Args:
        payload: Webhook payload from Lemon Squeezy
    """
    try:
        # Extract data
        subscription_data = payload.get("data", {})
        subscription_id = subscription_data.get("id")
        attributes = subscription_data.get("attributes", {})
        
        # Get related order data
        order_id = attributes.get("order_id")
        total = attributes.get("total")
        
        if not all([subscription_id, order_id, total]):
            logger.error(f"Missing required data in subscription_payment webhook")
            return
        
        # Get subscription details from database
        supabase = get_supabase_client()
        subscription_result = supabase.table("subscriptions").select("*").eq("subscription_id", subscription_id).execute()
        
        if not subscription_result.data or len(subscription_result.data) == 0:
            logger.error(f"No subscription found for id {subscription_id}")
            return
            
        subscription = subscription_result.data[0]
        product_id = subscription["product_id"]
        buyer_id = subscription["buyer_id"]
        seller_id = subscription["seller_id"]
        
        # Calculate fees (similar to one-time purchase)
        total_amount = float(total)
        
        # Check if seller is premium
        seller_data = supabase.table("profiles").select("lifetime_sales").eq("id", seller_id).execute()
        
        lifetime_sales = 0
        if seller_data.data and len(seller_data.data) > 0:
            lifetime_sales = float(seller_data.data[0].get("lifetime_sales", 0))
        
        # Apply appropriate fee rate
        if lifetime_sales > 10000:
            platform_fee_rate = 0.05  # 5%
        else:
            platform_fee_rate = 0.08  # 8%
        
        platform_fee = total_amount * platform_fee_rate
        processing_fee = (total_amount * 0.029) + 0.30
        seller_payout = total_amount - platform_fee - processing_fee
        
        # Format values
        platform_fee = round(platform_fee, 2)
        processing_fee = round(processing_fee, 2)
        seller_payout = round(seller_payout, 2)
        
        # Record the subscription payment
        payment_data = {
            "subscription_id": subscription_id,
            "order_id": order_id,
            "product_id": product_id,
            "buyer_id": buyer_id,
            "seller_id": seller_id,
            "amount": total_amount,
            "platform_fee": platform_fee,
            "processing_fee": processing_fee,
            "seller_payout": seller_payout,
            "status": "completed"
        }
        
        supabase.table("subscription_payments").insert(payment_data).execute()
        
        # Update seller's lifetime sales
        new_lifetime_sales = lifetime_sales + total_amount
        supabase.table("profiles").update({"lifetime_sales": new_lifetime_sales}).eq("id", seller_id).execute()
        
        # Send notification to seller
        notification_data = {
            "user_id": seller_id,
            "type": "subscription_payment",
            "title": "Subscription Payment Received",
            "message": f"You've received a subscription payment of ${total_amount}",
            "data": {"subscription_id": subscription_id},
            "read": False
        }
        supabase.table("notifications").insert(notification_data).execute()
        
        logger.info(f"Processed subscription payment for {subscription_id}")
        
    except Exception as e:
        logger.error(f"Error handling subscription_payment: {str(e)}")
        raise

async def handle_subscription_payment_failed(payload: dict):
    """
    Handle subscription.payment_failed webhook event
    
    This function processes a failed subscription payment.
    
    Args:
        payload: Webhook payload from Lemon Squeezy
    """
    try:
        # Extract data
        subscription_data = payload.get("data", {})
        subscription_id = subscription_data.get("id")
        
        if not subscription_id:
            logger.error("Missing subscription_id in payment_failed webhook")
            return
        
        # Get subscription details from database
        supabase = get_supabase_client()
        subscription_result = supabase.table("subscriptions").select("*").eq("subscription_id", subscription_id).execute()
        
        if not subscription_result.data or len(subscription_result.data) == 0:
            logger.error(f"No subscription found for id {subscription_id}")
            return
            
        subscription = subscription_result.data[0]
        seller_id = subscription["seller_id"]
        buyer_id = subscription["buyer_id"]
        
        # Record the failed payment
        payment_data = {
            "subscription_id": subscription_id,
            "buyer_id": buyer_id,
            "seller_id": seller_id,
            "status": "failed"
        }
        
        supabase.table("subscription_payments").insert(payment_data).execute()
        
        # Send notification to seller
        notification_data = {
            "user_id": seller_id,
            "type": "payment_failed",
            "title": "Subscription Payment Failed",
            "message": f"A subscription payment has failed",
            "data": {"subscription_id": subscription_id},
            "read": False
        }
        supabase.table("notifications").insert(notification_data).execute()
        
        logger.info(f"Recorded failed payment for subscription {subscription_id}")
        
    except Exception as e:
        logger.error(f"Error handling subscription_payment_failed: {str(e)}")
        raise
