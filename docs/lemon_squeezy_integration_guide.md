# Lemon Squeezy Integration Guide for HEKKA MARKET

This guide provides detailed instructions for integrating Lemon Squeezy as the payment processor for HEKKA MARKET.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Account Setup](#account-setup)
3. [Store Configuration](#store-configuration)
4. [API Integration](#api-integration)
5. [Webhook Configuration](#webhook-configuration)
6. [Frontend Implementation](#frontend-implementation)
7. [Backend Implementation](#backend-implementation)
8. [Testing](#testing)
9. [Going Live](#going-live)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

Before beginning the integration, ensure you have:

- A Lemon Squeezy account
- Access to HEKKA MARKET codebase (frontend and backend)
- Necessary permissions to update environment variables
- Understanding of React (frontend) and FastAPI (backend)

## Account Setup

1. **Create a Lemon Squeezy Account**:
   - Sign up at [lemonsqueezy.com](https://www.lemonsqueezy.com)
   - Complete the verification process
   - Provide business details and banking information

2. **Generate API Keys**:
   - Navigate to Settings > API in your Lemon Squeezy dashboard
   - Create a new API key with appropriate permissions
   - Save the API key securely (it will only be shown once)

3. **Set Up Webhook Secret**:
   - In Settings > Webhooks, generate a webhook secret
   - Save this secret for later configuration

## Store Configuration

1. **Create a Store**:
   - Go to Stores > Add New Store
   - Name: "HEKKA MARKET"
   - Configure store settings:
     - Currency: USD (or your preferred currency)
     - Business address
     - Email templates
     - Tax settings

2. **Configure Checkout Experience**:
   - Customize checkout appearance to match HEKKA MARKET branding
   - Set up post-purchase redirect URLs
   - Configure email receipt templates

3. **Set Up Tax Collection**:
   - Enable automatic tax calculation
   - Configure tax nexus locations if applicable
   - Set up tax registration numbers

## API Integration

### Environment Variables

Add the following to your `.env.local` file:

```
# Lemon Squeezy Configuration
VITE_LEMON_SQUEEZY_STORE_ID=your_store_id
VITE_LEMON_SQUEEZY_PUBLIC_KEY=your_public_key

# Backend Environment Variables
LEMON_SQUEEZY_API_KEY=your_api_key
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMON_SQUEEZY_SIGNING_SECRET=your_signing_secret
```

### Install Required Packages

```bash
# Frontend
cd frontend
yarn add @lemonsqueezy/lemonsqueezy.js

# Backend
cd backend
pip install lemonsqueezy-python
```

## Webhook Configuration

1. **Create Webhook Endpoint**:
   - In your Lemon Squeezy dashboard, go to Settings > Webhooks
   - Add a new webhook with URL: `https://your-api-domain.com/api/webhooks/lemonsqueezy`
   - Select events to listen for:
     - `order_created`
     - `order_refunded`
     - `subscription_created`
     - `subscription_updated`
     - `subscription_cancelled`
     - `subscription_payment_success`
     - `subscription_payment_failed`

2. **Secure Your Webhook**:
   - Use the webhook secret to verify incoming webhook requests
   - Implement signature verification in your backend

## Frontend Implementation

### 1. Create Checkout Component

```tsx
// src/components/LemonSqueezyCheckout.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

interface CheckoutProps {
  productId: string;
  productName: string;
  price: number;
  sellerId: string;
}

export function LemonSqueezyCheckout({ productId, productName, price, sellerId }: CheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      
      // Call your backend to create a checkout session
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          sellerId,
          productName,
          price
        }),
      });
      
      const data = await response.json();
      
      if (data.checkoutUrl) {
        // Redirect to Lemon Squeezy checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // Handle error state
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={isLoading}
      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
    >
      {isLoading ? 'Processing...' : `Buy Now - $${price.toFixed(2)}`}
    </Button>
  );
}
```

### 2. Add to Product Detail Page

```tsx
// src/pages/ProductDetail.tsx
import { LemonSqueezyCheckout } from '../components/LemonSqueezyCheckout';

// Inside your component
return (
  <div className="product-detail">
    {/* Product information */}
    <h1>{product.title}</h1>
    <p>{product.description}</p>
    
    {/* Checkout button */}
    <div className="mt-6">
      <LemonSqueezyCheckout 
        productId={product.id}
        productName={product.title}
        price={product.price}
        sellerId={product.seller_id}
      />
    </div>
  </div>
);
```

### 3. Create Thank You Page

```tsx
// src/pages/ThankYou.tsx
import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { Footer } from '../components/Footer';

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  useEffect(() => {
    // You can verify the purchase on page load if needed
    if (orderId) {
      verifyPurchase(orderId);
    }
  }, [orderId]);
  
  const verifyPurchase = async (orderId: string) => {
    try {
      await fetch(`/api/verify-purchase?order_id=${orderId}`);
    } catch (error) {
      console.error('Error verifying purchase:', error);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <span className="inline-block bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Thank You for Your Purchase!</h1>
          <p className="text-gray-600 mb-6">
            Your order has been successfully processed. You'll receive a confirmation email shortly.
          </p>
          
          <div className="space-y-4">
            <Link 
              to="/purchases" 
              className="block w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded"
            >
              View My Purchases
            </Link>
            <Link 
              to="/" 
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
```

## Backend Implementation

### 1. Create Checkout Endpoint

```python
# backend/routes/payments.py
from fastapi import APIRouter, Depends, HTTPException, Request
import httpx
import os
import json
from typing import Dict, Any
from ..models.payment import CheckoutRequest, CheckoutResponse
from ..utils.auth import get_current_user

router = APIRouter()

LEMON_SQUEEZY_API_KEY = os.getenv("LEMON_SQUEEZY_API_KEY")
LEMON_SQUEEZY_STORE_ID = os.getenv("LEMON_SQUEEZY_STORE_ID")
API_URL = "https://api.lemonsqueezy.com/v1"

@router.post("/create-checkout", response_model=CheckoutResponse)
async def create_checkout(
    request: CheckoutRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a Lemon Squeezy checkout session"""
    try:
        # Create a checkout in Lemon Squeezy
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_URL}/checkouts",
                headers={
                    "Authorization": f"Bearer {LEMON_SQUEEZY_API_KEY}",
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                json={
                    "data": {
                        "type": "checkouts",
                        "attributes": {
                            "store_id": LEMON_SQUEEZY_STORE_ID,
                            "custom_price": int(request.price * 100),  # Convert to cents
                            "product_options": {
                                "name": request.product_name,
                                "description": f"Purchase of {request.product_name} on HEKKA MARKET",
                                "redirect_url": f"{os.getenv('FRONTEND_URL')}/thank-you",
                                "receipt_link_url": f"{os.getenv('FRONTEND_URL')}/purchases",
                                "receipt_button_text": "View Your Purchase"
                            },
                            "checkout_data": {
                                "custom": {
                                    "product_id": request.product_id,
                                    "buyer_id": current_user["id"],
                                    "seller_id": request.seller_id
                                }
                            }
                        }
                    }
                }
            )
            
            if response.status_code != 201:
                raise HTTPException(status_code=400, detail="Failed to create checkout")
                
            checkout_data = response.json()
            return {"checkoutUrl": checkout_data["data"]["attributes"]["url"]}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 2. Create Webhook Handler

```python
# backend/routes/webhooks.py
from fastapi import APIRouter, Request, HTTPException, Header
import hmac
import hashlib
import json
import os
from typing import Optional
from ..database import get_db_connection
from ..models.payment import WebhookEvent

router = APIRouter()

WEBHOOK_SECRET = os.getenv("LEMON_SQUEEZY_WEBHOOK_SECRET")

def verify_signature(payload_body: bytes, signature_header: str) -> bool:
    """Verify that the webhook signature is valid"""
    if not signature_header:
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
    """Handle Lemon Squeezy webhooks"""
    # Get the raw request body
    payload_body = await request.body()
    
    # Verify webhook signature
    if not verify_signature(payload_body, x_signature):
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Parse the webhook payload
    payload = json.loads(payload_body)
    event_name = payload.get("meta", {}).get("event_name")
    
    # Handle different event types
    if event_name == "order_created":
        await handle_order_created(payload)
    elif event_name == "order_refunded":
        await handle_order_refunded(payload)
    # Add handlers for other event types as needed
    
    return {"status": "success"}

async def handle_order_created(payload: dict):
    """Handle order.created webhook event"""
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
        
        # Calculate fees
        platform_fee = float(total) * 0.08  # 8% platform fee
        processing_fee = (float(total) * 0.029) + 0.30  # 2.9% + $0.30 processing fee
        seller_payout = float(total) - platform_fee - processing_fee
        
        # Insert purchase record into database
        async with get_db_connection() as conn:
            await conn.execute(
                """
                INSERT INTO purchases (
                    product_id, buyer_id, seller_id, transaction_id, order_id,
                    amount, platform_fee, processing_fee, seller_payout, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """,
                product_id, buyer_id, seller_id, order_id, order_id,
                total, platform_fee, processing_fee, seller_payout, status
            )
            
    except Exception as e:
        # Log the error but don't raise an exception
        # This prevents Lemon Squeezy from retrying the webhook
        print(f"Error handling order.created: {str(e)}")

async def handle_order_refunded(payload: dict):
    """Handle order.refunded webhook event"""
    try:
        # Extract data from payload
        order_data = payload.get("data", {})
        order_id = order_data.get("id")
        
        # Update purchase record in database
        async with get_db_connection() as conn:
            await conn.execute(
                """
                UPDATE purchases
                SET status = 'refunded', refunded_at = NOW()
                WHERE order_id = $1
                """,
                order_id
            )
            
    except Exception as e:
        print(f"Error handling order.refunded: {str(e)}")
```

### 3. Create Database Models

```python
# backend/models/payment.py
from pydantic import BaseModel
from typing import Optional, Dict, Any

class CheckoutRequest(BaseModel):
    product_id: str
    product_name: str
    price: float
    seller_id: str

class CheckoutResponse(BaseModel):
    checkoutUrl: str

class WebhookEvent(BaseModel):
    meta: Dict[str, Any]
    data: Dict[str, Any]
```

## Testing

### Test Mode

1. **Enable Test Mode**:
   - In your Lemon Squeezy dashboard, go to Settings > General
   - Enable Test Mode
   - This allows you to make test purchases without real money

2. **Test Credit Card**:
   - Use the following test card details:
     - Card Number: 4242 4242 4242 4242
     - Expiry: Any future date
     - CVC: Any 3 digits

### Testing Checklist

1. **Checkout Flow**:
   - Create a test product
   - Initiate checkout
   - Complete payment with test card
   - Verify redirect to thank you page

2. **Webhook Processing**:
   - Verify webhook is received
   - Check purchase record in database
   - Verify correct fee calculations

3. **Refund Processing**:
   - Issue a refund in Lemon Squeezy dashboard
   - Verify webhook is received
   - Check purchase status is updated in database

## Going Live

1. **Disable Test Mode**:
   - In your Lemon Squeezy dashboard, go to Settings > General
   - Disable Test Mode

2. **Update Environment Variables**:
   - Ensure all environment variables are set for production

3. **Final Verification**:
   - Make a small real purchase to verify the entire flow
   - Check that funds are properly processed
   - Verify seller payouts are calculated correctly

## Troubleshooting

### Common Issues

1. **Webhook Not Received**:
   - Check webhook URL is correct
   - Verify webhook secret is properly configured
   - Check server logs for any errors

2. **Checkout Creation Fails**:
   - Verify API key has correct permissions
   - Check for any validation errors in request payload
   - Ensure store ID is correct

3. **Payment Processing Issues**:
   - Check Lemon Squeezy dashboard for transaction status
   - Verify customer information is correctly passed
   - Check for any currency conversion issues

### Debugging Tools

1. **Lemon Squeezy Dashboard**:
   - View transaction logs
   - Check webhook delivery status
   - Review error messages

2. **Server Logs**:
   - Monitor backend logs during checkout and webhook processing
   - Look for any API request/response errors

3. **Network Monitoring**:
   - Use browser developer tools to monitor network requests
   - Check for any failed API calls or redirects

---

*This integration guide is based on Lemon Squeezy API v1. Check the [official documentation](https://docs.lemonsqueezy.com/api) for the most up-to-date information.*
