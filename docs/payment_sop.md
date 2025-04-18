# HEKKA MARKET Payment System SOP

## 1. Payment System Overview

HEKKA MARKET utilizes Lemon Squeezy as its primary payment processor to handle all transactions on the platform. This Standard Operating Procedure (SOP) outlines the payment methods, processing workflows, fee structure, and policies governing the payment system.

### 1.1 Core Principles

- **Transparency**: Clear fee structure and payment terms for all users
- **Security**: Industry-standard security measures to protect payment information
- **Efficiency**: Fast processing of payments and payouts
- **Compliance**: Adherence to relevant tax and financial regulations

## 2. Payment Methods and Processing

### 2.1 Supported Payment Methods

HEKKA MARKET supports the following payment methods through Lemon Squeezy:

- Credit/Debit Cards (Visa, Mastercard, American Express, Discover)
- Apple Pay
- Google Pay
- PayPal (where available)

### 2.2 Payment Processing Workflow

1. **Checkout Initiation**:
   - Buyer selects a product and proceeds to checkout
   - Buyer is redirected to Lemon Squeezy checkout page

2. **Payment Verification**:
   - Lemon Squeezy validates payment information
   - Anti-fraud checks are performed

3. **Transaction Completion**:
   - Upon successful payment, Lemon Squeezy sends a webhook to HEKKA MARKET
   - HEKKA MARKET records the transaction in the purchases table
   - Buyer receives confirmation email with receipt

4. **Product Delivery**:
   - Digital product access is granted immediately
   - Download links or access credentials are provided to the buyer

## 3. Fee Structure

### 3.1 Platform Fees

HEKKA MARKET implements a tiered fee structure:

- **Standard Fee**: 8% of transaction value + payment processing fees
- **Premium Seller Fee**: 5% of transaction value + payment processing fees (for sellers with >$10,000 in lifetime sales)

### 3.2 Payment Processing Fees

Payment processing fees are passed through from Lemon Squeezy:

- **Credit/Debit Cards**: 2.9% + $0.30 per transaction
- **Apple Pay/Google Pay**: 2.9% + $0.30 per transaction
- **PayPal**: 3.5% + $0.30 per transaction (may vary by region)

### 3.3 Fee Calculation Example

For a $100 product:
- Platform fee (8%): $8.00
- Payment processing fee (2.9% + $0.30): $3.20
- Total fees: $11.20
- Seller receives: $88.80

## 4. Payout Policies

### 4.1 Payout Schedule

- **Weekly Payouts**: Available for all sellers (processed every Monday)
- **Daily Payouts**: Available for Premium Sellers (processed each business day)
- **Manual Payouts**: Available on request (minimum balance of $100 required)

### 4.2 Payout Methods

- **Direct Bank Transfer**: Available in 50+ countries (primary method)
- **PayPal**: Available as an alternative where bank transfers are not supported

### 4.3 Payout Requirements

To receive payouts, sellers must:

1. Complete account verification (KYC)
2. Have a minimum balance of $50 for weekly payouts
3. Have valid banking information on file
4. Have no unresolved disputes or policy violations

### 4.4 Payout Holding Period

- New sellers: 14-day holding period for first 3 months
- Established sellers: 7-day holding period
- Premium sellers: 3-day holding period

## 5. Refund Policies

### 5.1 Platform Refund Policy

HEKKA MARKET maintains a 30-day refund policy for digital products:

- Buyers can request refunds within 30 days of purchase
- Refunds are processed through the platform, not directly between buyer and seller
- Platform fees are non-refundable

### 5.2 Refund Process

1. Buyer submits refund request through their account
2. Seller is notified and has 48 hours to respond
3. If approved or no response, refund is processed automatically
4. If disputed, HEKKA MARKET support reviews the case

### 5.3 Refund Impact on Sellers

- Refunded amounts are deducted from seller's next payout
- Excessive refund rates (>10%) may result in account review
- Processing fees are not refunded to sellers

## 6. Tax Handling

### 6.1 Sales Tax Collection

- Lemon Squeezy automatically calculates, collects, and remits sales tax where required
- Tax rates are determined based on buyer's location and applicable laws
- Sellers are not responsible for sales tax collection or remittance

### 6.2 Tax Documentation

- Sellers receive monthly sales reports with tax details
- Annual 1099-K forms are provided to US sellers meeting threshold requirements
- International sellers receive equivalent documentation as required by local laws

## 7. Dispute Resolution

### 7.1 Chargeback Handling

- Chargebacks are initially covered by HEKKA MARKET
- Sellers are notified of chargebacks and given opportunity to provide evidence
- If chargeback is upheld, amount is deducted from seller's balance
- Excessive chargebacks may result in increased fees or account suspension

### 7.2 Dispute Process

1. Buyer files dispute through payment provider
2. HEKKA MARKET notifies seller and freezes related funds
3. Seller provides evidence within 7 days
4. HEKKA MARKET submits evidence to payment provider
5. Resolution is communicated to both parties

## 8. Security Measures

### 8.1 Payment Information Security

- No payment card information is stored on HEKKA MARKET servers
- All payment processing is handled by Lemon Squeezy (PCI DSS compliant)
- Secure HTTPS connections are enforced for all transactions

### 8.2 Fraud Prevention

- Automated risk scoring for all transactions
- IP address verification
- Device fingerprinting
- Suspicious activity monitoring
- Manual review of high-risk transactions

## 9. Implementation Guidelines

### 9.1 Lemon Squeezy Integration

#### 9.1.1 Account Setup

1. Create a Lemon Squeezy account at [lemonsqueezy.com](https://www.lemonsqueezy.com)
2. Complete business verification
3. Configure store settings and branding
4. Generate API keys for integration

#### 9.1.2 API Integration

```javascript
// Example Lemon Squeezy checkout integration
const createCheckout = async (productId, userId) => {
  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LEMON_SQUEEZY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          product_id: productId,
          custom_price: null, // Use product's price
          checkout_data: {
            custom: {
              user_id: userId
            }
          },
          redirect_url: `${HEKKA_MARKET_URL}/thank-you`,
          receipt_link_url: `${HEKKA_MARKET_URL}/purchases`
        }
      }
    })
  });
  
  const data = await response.json();
  return data.data.attributes.url; // Checkout URL
};
```

#### 9.1.3 Webhook Configuration

1. Set up webhook endpoint in HEKKA MARKET backend
2. Configure webhook in Lemon Squeezy dashboard to notify on:
   - Order Created
   - Order Refunded
   - Subscription Created
   - Subscription Cancelled
   - Subscription Updated

#### 9.1.4 Environment Variables

Required environment variables for Lemon Squeezy integration:

```
LEMON_SQUEEZY_API_KEY=your_api_key
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMON_SQUEEZY_STORE_ID=your_store_id
```

### 9.2 Database Schema

The purchases table should include:

```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  transaction_id TEXT NOT NULL, -- from Lemon Squeezy
  order_id TEXT NOT NULL, -- from Lemon Squeezy
  amount NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  processing_fee NUMERIC NOT NULL,
  seller_payout NUMERIC NOT NULL,
  status TEXT NOT NULL, -- 'completed', 'refunded', 'disputed'
  refunded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX idx_purchases_seller_id ON purchases(seller_id);
CREATE INDEX idx_purchases_product_id ON purchases(product_id);
CREATE INDEX idx_purchases_created_at ON purchases(created_at);
```

## 10. Seller Onboarding

### 10.1 Seller Verification Requirements

New sellers must provide:

1. Valid government-issued ID
2. Proof of address (utility bill, bank statement)
3. Tax identification number (W-9 for US sellers, W-8BEN for international)
4. Bank account information for payouts

### 10.2 Seller Agreement

All sellers must agree to:

1. HEKKA MARKET Terms of Service
2. Seller Guidelines
3. Fee structure and payout terms
4. Refund and dispute policies

## 11. Reporting and Analytics

### 11.1 Seller Dashboard

Sellers have access to:

- Real-time sales data
- Payout history and scheduled payouts
- Refund and dispute metrics
- Tax information
- Customer geographic distribution

### 11.2 Financial Reports

Available reports include:

- Monthly sales summary
- Quarterly tax reports
- Annual earnings statement
- Fee breakdown by transaction
- Payout reconciliation reports

## 12. Compliance and Legal

### 12.1 Regulatory Compliance

HEKKA MARKET ensures compliance with:

- Payment Card Industry Data Security Standard (PCI DSS)
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Know Your Customer (KYC) and Anti-Money Laundering (AML) regulations

### 12.2 Record Keeping

All transaction records are maintained for a minimum of 7 years, including:

- Purchase details
- Payment information (excluding sensitive card data)
- Refund and dispute history
- Seller payout records

## 13. Support and Escalation

### 13.1 Payment Support Channels

- Email support: payments@hekkamarket.com
- Support ticket system
- Live chat (for Premium Sellers)

### 13.2 Escalation Path

1. First-level support: Payment Support Team
2. Second-level: Payment Operations Manager
3. Final escalation: Finance Director

## 14. Policy Updates

This Payment SOP will be reviewed quarterly and updated as needed. All sellers will be notified of significant changes with a 30-day notice period before implementation.

---

*Last Updated: [Current Date]*

*Version: 1.0*
