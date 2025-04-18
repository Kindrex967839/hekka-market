# HEKKA MARKET Payment Dashboard UI Mockup

This document provides a detailed mockup of the Payment Dashboard for HEKKA MARKET sellers. The dashboard is designed to give sellers a comprehensive view of their earnings, payouts, and financial metrics.

## Dashboard Overview

```
+----------------------------------------------------------------------+
|                                                                      |
|  HEKKA MARKET                                       [User Profile ▼] |
|                                                                      |
+----------------------------------------------------------------------+
|                                                                      |
| [Dashboard] [Products] [Orders] [Payments] [Settings] [Help]         |
|                                                                      |
+----------------------------------------------------------------------+
|                                                                      |
|  PAYMENTS DASHBOARD                                                  |
|                                                                      |
|  +---------------------------+  +---------------------------+        |
|  | AVAILABLE BALANCE         |  | NEXT PAYOUT               |        |
|  | $1,245.80                 |  | $1,245.80 on Jul 15, 2023 |        |
|  |                           |  |                           |        |
|  | [Withdraw Funds]          |  | Weekly Payouts ▼          |        |
|  +---------------------------+  +---------------------------+        |
|                                                                      |
|  +---------------------------+  +---------------------------+        |
|  | LIFETIME EARNINGS         |  | THIS MONTH                |        |
|  | $24,567.90                |  | $3,456.78                 |        |
|  |                           |  |                           |        |
|  | [View Earnings Report]    |  | +15% from last month      |        |
|  +---------------------------+  +---------------------------+        |
|                                                                      |
+----------------------------------------------------------------------+
|                                                                      |
|  SALES OVERVIEW                                       [Last 30 days▼]|
|                                                                      |
|  +------------------------------------------------------------------+|
|  |                                                                  ||
|  |  $                                                               ||
|  |                                                                  ||
|  |  +---------------------------------------------------------+    ||
|  |  |                                                         |    ||
|  |  |                                                         |    ||
|  |  |                                                         |    ||
|  |  +----+----+----+----+----+----+----+----+----+----+----+-+    ||
|  |      1    5    10   15   20   25   30                          ||
|  |                                                                  ||
|  +------------------------------------------------------------------+|
|                                                                      |
+----------------------------------------------------------------------+
|                                                                      |
|  RECENT TRANSACTIONS                                    [View All >] |
|                                                                      |
|  +------------------------------------------------------------------+|
|  | DATE       | PRODUCT           | BUYER     | AMOUNT  | STATUS    ||
|  |------------|-------------------|-----------|---------|------------||
|  | 2023-07-10 | Digital Template  | john_doe  | $29.99  | Completed ||
|  | 2023-07-09 | Premium Course    | user123   | $89.99  | Completed ||
|  | 2023-07-08 | E-book Bundle     | creative7 | $49.99  | Completed ||
|  | 2023-07-07 | UI Kit            | designer  | $59.99  | Refunded  ||
|  | 2023-07-05 | Stock Photos      | photo_pro | $19.99  | Completed ||
|  +------------------------------------------------------------------+|
|                                                                      |
+----------------------------------------------------------------------+
```

## Detailed Component Specifications

### 1. Header Section

The header contains four key financial metrics cards:

#### 1.1 Available Balance Card
- **Title**: "AVAILABLE BALANCE"
- **Value**: Current available balance (e.g., "$1,245.80")
- **Action Button**: "Withdraw Funds" - Opens withdrawal modal
- **Visual**: Green accent color to indicate positive balance

#### 1.2 Next Payout Card
- **Title**: "NEXT PAYOUT"
- **Value**: Amount and date of next scheduled payout
- **Dropdown**: Payout frequency selector (Weekly, Monthly, Quarterly)
- **Visual**: Calendar icon and countdown to next payout

#### 1.3 Lifetime Earnings Card
- **Title**: "LIFETIME EARNINGS"
- **Value**: Total earnings since account creation
- **Action Link**: "View Earnings Report" - Opens detailed earnings report
- **Visual**: Upward trend icon

#### 1.4 Current Month Card
- **Title**: "THIS MONTH"
- **Value**: Current month's earnings
- **Comparison**: Percentage change from previous month
- **Visual**: Up/down arrow based on comparison

### 2. Sales Overview Chart

A visual representation of sales over time:

- **Title**: "SALES OVERVIEW"
- **Chart Type**: Line chart showing daily sales
- **Time Range Selector**: Dropdown with options (Last 7 days, Last 30 days, Last 90 days, Year to date, Custom)
- **Y-Axis**: Sales amount
- **X-Axis**: Time period
- **Hover State**: Shows exact amount and date on hover
- **Visual**: Gradient fill under the line for visual emphasis

### 3. Recent Transactions Table

A table showing the most recent sales:

- **Title**: "RECENT TRANSACTIONS"
- **Action Link**: "View All" - Takes user to full transactions page
- **Columns**:
  - Date (sortable)
  - Product (with truncation for long names)
  - Buyer (username, anonymized)
  - Amount (with currency symbol)
  - Status (with color coding: Green for Completed, Red for Refunded, Yellow for Pending)
- **Pagination**: Shows 5 transactions per page on dashboard
- **Row Hover**: Highlights row on hover
- **Row Click**: Opens detailed transaction view

## Additional Dashboard Pages

### 1. Transactions Page

```
+----------------------------------------------------------------------+
|                                                                      |
|  TRANSACTIONS                                                        |
|                                                                      |
|  [All Transactions ▼]  [Search...]  [Filter ▼]  [Export CSV]         |
|                                                                      |
|  +------------------------------------------------------------------+|
|  | DATE       | PRODUCT           | BUYER     | AMOUNT  | STATUS    ||
|  |------------|-------------------|-----------|---------|------------||
|  | 2023-07-10 | Digital Template  | john_doe  | $29.99  | Completed ||
|  | 2023-07-09 | Premium Course    | user123   | $89.99  | Completed ||
|  | 2023-07-08 | E-book Bundle     | creative7 | $49.99  | Completed ||
|  | 2023-07-07 | UI Kit            | designer  | $59.99  | Refunded  ||
|  | 2023-07-05 | Stock Photos      | photo_pro | $19.99  | Completed ||
|  | ...        | ...               | ...       | ...     | ...       ||
|  +------------------------------------------------------------------+|
|                                                                      |
|  Showing 1-10 of 143 transactions       [< 1 2 3 ... 15 >]          |
|                                                                      |
+----------------------------------------------------------------------+
```

### 2. Payout History Page

```
+----------------------------------------------------------------------+
|                                                                      |
|  PAYOUT HISTORY                                                      |
|                                                                      |
|  [All Payouts ▼]  [Search...]  [Filter ▼]  [Export CSV]              |
|                                                                      |
|  +------------------------------------------------------------------+|
|  | DATE       | AMOUNT    | METHOD           | STATUS    | DETAILS  ||
|  |------------|-----------|------------------|-----------|----------||
|  | 2023-07-01 | $1,245.80 | Bank Transfer    | Completed | [View]   ||
|  | 2023-06-15 | $978.50   | Bank Transfer    | Completed | [View]   ||
|  | 2023-06-01 | $1,102.75 | Bank Transfer    | Completed | [View]   ||
|  | 2023-05-15 | $856.30   | PayPal           | Completed | [View]   ||
|  | 2023-05-01 | $1,320.45 | Bank Transfer    | Completed | [View]   ||
|  +------------------------------------------------------------------+|
|                                                                      |
|  Showing 1-5 of 24 payouts             [< 1 2 3 4 5 >]              |
|                                                                      |
+----------------------------------------------------------------------+
```

### 3. Analytics Page

```
+----------------------------------------------------------------------+
|                                                                      |
|  ANALYTICS                                           [Last 90 days▼] |
|                                                                      |
|  +---------------------------+  +---------------------------+        |
|  | TOTAL SALES               |  | AVERAGE ORDER VALUE       |        |
|  | $4,567.90                 |  | $45.67                    |        |
|  |                           |  |                           |        |
|  | +12% from previous period |  | -3% from previous period  |        |
|  +---------------------------+  +---------------------------+        |
|                                                                      |
|  +---------------------------+  +---------------------------+        |
|  | CONVERSION RATE           |  | REFUND RATE               |        |
|  | 3.2%                      |  | 1.5%                      |        |
|  |                           |  |                           |        |
|  | +0.5% from previous period|  | -0.2% from previous period|        |
|  +---------------------------+  +---------------------------+        |
|                                                                      |
|  SALES BY PRODUCT                                                    |
|  +------------------------------------------------------------------+|
|  |                                                                  ||
|  |  [Pie chart showing sales distribution by product]               ||
|  |                                                                  ||
|  +------------------------------------------------------------------+|
|                                                                      |
|  SALES BY GEOGRAPHY                                                  |
|  +------------------------------------------------------------------+|
|  |                                                                  ||
|  |  [World map with heat map overlay showing sales by country]      ||
|  |                                                                  ||
|  +------------------------------------------------------------------+|
|                                                                      |
+----------------------------------------------------------------------+
```

### 4. Tax Reports Page

```
+----------------------------------------------------------------------+
|                                                                      |
|  TAX REPORTS                                                         |
|                                                                      |
|  [2023 ▼]  [Generate Report]  [Download All]                         |
|                                                                      |
|  +------------------------------------------------------------------+|
|  | PERIOD     | SALES     | TAX COLLECTED | STATUS    | DOWNLOAD    ||
|  |------------|-----------|---------------|-----------|-------------||
|  | Q2 2023    | $3,245.80 | $259.66       | Available | [PDF][CSV]  ||
|  | Q1 2023    | $2,978.50 | $238.28       | Available | [PDF][CSV]  ||
|  | Q4 2022    | $4,102.75 | $328.22       | Available | [PDF][CSV]  ||
|  | Q3 2022    | $3,856.30 | $308.50       | Available | [PDF][CSV]  ||
|  | Q2 2022    | $2,320.45 | $185.64       | Available | [PDF][CSV]  ||
|  +------------------------------------------------------------------+|
|                                                                      |
|  TAX INFORMATION                                                     |
|                                                                      |
|  Your tax information:                                               |
|  Tax ID: XXXX-XXXX-XXXX                                              |
|  Tax Form: W-9                                                       |
|                                                                      |
|  [Update Tax Information]                                            |
|                                                                      |
+----------------------------------------------------------------------+
```

## Mobile Responsive Design

The dashboard is designed to be fully responsive:

### Mobile View (Payments Dashboard)

```
+----------------------------------+
|                                  |
| HEKKA MARKET         [≡] [User] |
|                                  |
+----------------------------------+
|                                  |
| PAYMENTS DASHBOARD               |
|                                  |
| +------------------------------+ |
| | AVAILABLE BALANCE            | |
| | $1,245.80                    | |
| |                              | |
| | [Withdraw Funds]             | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | NEXT PAYOUT                  | |
| | $1,245.80 on Jul 15, 2023    | |
| |                              | |
| | Weekly Payouts ▼             | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | LIFETIME EARNINGS            | |
| | $24,567.90                   | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | THIS MONTH                   | |
| | $3,456.78                    | |
| |                              | |
| | +15% from last month         | |
| +------------------------------+ |
|                                  |
| SALES OVERVIEW     [Last 30 days▼]|
|                                  |
| [Line chart - simplified for     |
|  mobile view]                    |
|                                  |
| RECENT TRANSACTIONS  [View All >]|
|                                  |
| • Jul 10 - Digital Template      |
|   $29.99 - Completed             |
|                                  |
| • Jul 09 - Premium Course        |
|   $89.99 - Completed             |
|                                  |
| • Jul 08 - E-book Bundle         |
|   $49.99 - Completed             |
|                                  |
+----------------------------------+
```

## Interactive Elements

### 1. Withdraw Funds Modal

```
+------------------------------------------+
|                                          |
| WITHDRAW FUNDS                      [X]  |
|                                          |
| Available Balance: $1,245.80             |
|                                          |
| Withdrawal Amount:                       |
| +----------------------------------+     |
| | $1,245.80                        |     |
| +----------------------------------+     |
|                                          |
| Withdrawal Method:                       |
| +----------------------------------+     |
| | Bank Transfer (****1234)      ▼ |     |
| +----------------------------------+     |
|                                          |
| Estimated Arrival: 2-3 business days     |
|                                          |
| [Cancel]         [Confirm Withdrawal]    |
|                                          |
+------------------------------------------+
```

### 2. Transaction Details Modal

```
+------------------------------------------+
|                                          |
| TRANSACTION DETAILS                 [X]  |
|                                          |
| Order #ORD-12345678                      |
| July 10, 2023 at 14:32 UTC               |
|                                          |
| Product: Digital Template                |
| Price: $29.99                            |
|                                          |
| Buyer: john_doe                          |
| Location: United States                  |
|                                          |
| Payment Breakdown:                       |
| Product Price:         $29.99            |
| Platform Fee (8%):     -$2.40            |
| Processing Fee:        -$1.17            |
| Your Earnings:         $26.42            |
|                                          |
| Status: Completed                        |
|                                          |
| [Download Invoice]    [Contact Support]  |
|                                          |
+------------------------------------------+
```

## Implementation Notes

1. **Technology Stack**:
   - Frontend: React with Tailwind CSS
   - Charts: Chart.js or Recharts
   - Data fetching: React Query

2. **Color Scheme**:
   - Primary: #ff3b9a (HEKKA MARKET pink)
   - Secondary: #f7d046 (HEKKA MARKET yellow)
   - Success: #10b981 (green)
   - Warning: #f59e0b (amber)
   - Danger: #ef4444 (red)
   - Background: #ffffff (white)
   - Text: #1f2937 (gray-800)

3. **Typography**:
   - Headings: Inter, sans-serif
   - Body: Inter, sans-serif
   - Monospace (for amounts): Roboto Mono, monospace

4. **Accessibility Considerations**:
   - All interactive elements must be keyboard accessible
   - Color contrast ratios must meet WCAG AA standards
   - Screen reader compatible with proper ARIA attributes
   - Focus states clearly visible

5. **Performance Optimization**:
   - Lazy loading for charts and tables
   - Pagination for large datasets
   - Caching of financial data
   - Optimistic UI updates for better user experience

---

This mockup provides a comprehensive view of the Payment Dashboard UI for HEKKA MARKET. The design focuses on clarity, usability, and providing sellers with all the financial information they need to manage their business effectively.
