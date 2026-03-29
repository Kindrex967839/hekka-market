# Specification: PostgreSQL Migration & Feature Completion

**Feature ID**: 001  
**Status**: Draft  
**Author**: Pi Agent  
**Created**: 2026-03-29  
**Last Updated**: 2026-03-29

---

## Problem Statement

HEKKA MARKET currently relies on Supabase for database and storage, creating vendor dependency and limiting control over infrastructure. Several features are incomplete (messaging UI, shopping cart, analytics), and critical infrastructure is missing (tests, proper auth, monitoring). This specification defines the migration to self-hosted PostgreSQL and completion of missing features.

---

## Goals

1. Migrate from Supabase to self-hosted PostgreSQL (Docker) with zero data loss
2. Maintain Clerk authentication while removing Supabase auth dependency
3. Implement missing features (messaging, cart, analytics)
4. Add missing infrastructure (tests, error handling, monitoring)
5. Improve existing features (search, mobile, image handling)

---

## Non-Goals

1. Migrating away from Clerk authentication (keep Clerk for auth)
2. Changing the tech stack (React, FastAPI, TypeScript, Python remain)
3. Real-time collaboration features
4. Mobile native applications
5. Blockchain/Web3 features

---

## User Stories

### US-001: Database Migration
**As a** DevOps engineer  
**I want** to run the application against a self-hosted PostgreSQL database  
**So that** we have full control over our data infrastructure

**Acceptance Criteria**:
- Given a fresh Docker environment, when I run `docker-compose up`, then PostgreSQL is available
- Given existing Supabase data, when I run the migration script, then all data is transferred
- Given the migrated database, when the application connects, then all features work identically

### US-002: Connection Pooling
**As a** backend developer  
**I want** connection pooling configured  
**So that** the application handles concurrent requests efficiently

**Acceptance Criteria**:
- Given high traffic, when multiple requests arrive, then connections are pooled efficiently
- Given PgBouncer configuration, when the app starts, then pool connections are established
- Given connection limits, when pool is exhausted, then graceful degradation occurs

### US-003: User Authentication Flow
**As a** user  
**I want** to sign up, sign in, and sign out  
**So that** I can access my account securely

**Acceptance Criteria**:
- Given valid credentials, when I sign in, then I receive a valid JWT token
- Given an invalid email, when I sign up, then I see a clear error message
- Given an existing session, when I sign out, then my session is invalidated

### US-004: Direct Messaging
**As a** buyer  
**I want** to send messages to sellers  
**So that** I can ask questions before purchasing

**Acceptance Criteria**:
- Given I'm viewing a product, when I click "Message Seller", then a conversation starts
- Given an ongoing conversation, when I send a message, then the recipient sees it in real-time
- Given unread messages, when I view my inbox, then I see unread indicators

### US-005: Shopping Cart
**As a** buyer  
**I want** to add multiple products to a cart  
**So that** I can purchase them together

**Acceptance Criteria**:
- Given I'm browsing products, when I click "Add to Cart", then the product is added
- Given items in my cart, when I view the cart, then I see all items with totals
- Given a non-empty cart, when I proceed to checkout, then all items are included

### US-006: Seller Analytics Dashboard
**As a** seller  
**I want** to view my sales analytics  
**So that** I can understand my business performance

**Acceptance Criteria**:
- Given I'm a seller, when I view my dashboard, then I see sales over time
- Given products I've sold, when I filter by date, then I see relevant analytics
- Given visitor data, when available, then conversion rates are displayed

### US-007: Product Reviews
**As a** buyer  
**I want** to leave reviews for purchased products  
**So that** other buyers can make informed decisions

**Acceptance Criteria**:
- Given I've purchased a product, when I leave a review, then it's associated with my purchase
- Given a product page, when I view reviews, then I see ratings and comments
- Given my review, when I want to edit it, then I can update it within 30 days

### US-008: Advanced Search
**As a** buyer  
**I want** to search products with filters  
**So that** I can find exactly what I need

**Acceptance Criteria**:
- Given a search query, when I type, then results update with debouncing
- Given search results, when I filter by price range, then results narrow
- Given filters applied, when I sort by relevance/price/date, then results reorder

### US-009: Error Handling
**As a** user  
**I want** clear error messages  
**So that** I can understand and recover from issues

**Acceptance Criteria**:
- Given an API error, when it occurs, then I see a user-friendly message
- Given a network failure, when it happens, then the app retries gracefully
- Given a fatal error, when it occurs, then I see an error boundary with recovery options

### US-010: Test Coverage
**As a** developer  
**I want** comprehensive test coverage  
**So that** I can refactor with confidence

**Acceptance Criteria**:
- Given any module, when tests run, then coverage is ≥ 80%
- Given a pull request, when CI runs, then all tests pass
- Given a regression, when it occurs, then a test is added to prevent recurrence

### US-011: Mobile Responsiveness
**As a** mobile user  
**I want** the app to work on my phone  
**So that** I can shop on the go

**Acceptance Criteria**:
- Given a mobile viewport, when I browse, then layouts adapt properly
- Given touch interactions, when I tap, then elements respond appropriately
- Given a slow connection, when I load pages, then content prioritizes above the fold

### US-012: Admin Dashboard
**As an** administrator  
**I want** to manage users and products  
**So that** I can maintain platform quality

**Acceptance Criteria**:
- Given admin access, when I view the dashboard, then I see platform metrics
- Given reported content, when I review it, then I can approve/remove it
- Given user accounts, when needed, then I can suspend/activate them

---

## Functional Requirements

### FR-001: Database Connection
The system MUST connect to PostgreSQL using environment-configured connection strings with SSL support.

### FR-002: Migrations
The system MUST apply database migrations on startup using Alembic (backend) and track applied migrations.

### FR-003: Connection Pooling
The system MUST use connection pooling (PgBouncer or asyncpg pool) for database connections.

### FR-004: Data Export
The system MUST provide a script to export all Supabase data to JSON/CSV format.

### FR-005: Data Import
The system MUST provide a script to import exported data into PostgreSQL with validation.

### FR-006: Authentication Integration
The system MUST validate Clerk JWT tokens for all authenticated endpoints.

### FR-007: User Profile Sync
The system MUST sync Clerk user data to local profiles table on first sign-in.

### FR-008: Message Storage
The system MUST store messages in the database with sender, recipient, content, and timestamps.

### FR-009: Message Delivery
The system MUST provide real-time message delivery via WebSockets (optional) or polling.

### FR-010: Cart Persistence
The system MUST persist cart items in the database for authenticated users.

### FR-011: Cart Session
The system MUST support guest carts with session-based storage, mergable on login.

### FR-012: Analytics Collection
The system MUST collect page views, purchases, and user interactions for analytics.

### FR-013: Review Moderation
The system MUST allow admins to moderate reviews (approve/reject).

### FR-014: Search Indexing
The system MUST index products for full-text search with PostgreSQL tsvector.

### FR-015: API Error Responses
The system MUST return structured error responses with code, message, and details.

### FR-016: Health Check
The system MUST expose `/health` endpoint returning database connectivity status.

### FR-017: Structured Logging
The system MUST output JSON-formatted logs with request IDs for tracing.

### FR-018: Graceful Shutdown
The system MUST handle SIGTERM by completing in-flight requests before exiting.

---

## Non-Functional Requirements

### NFR-001: Performance
API responses MUST complete within 200ms (95th percentile) under normal load.

### NFR-002: Scalability
The system MUST handle 100 concurrent connections without degradation.

### NFR-003: Availability
The system MUST achieve 99.5% uptime with health monitoring.

### NFR-004: Backup
Database backups MUST run daily with 30-day retention.

### NFR-005: Security
All API endpoints MUST require authentication except explicitly public ones.

### NFR-006: Compliance
The system MUST NOT store payment card data (PCI-DSS compliance).

---

## Success Criteria

1. **Migration Complete**: All Supabase data migrated to PostgreSQL with zero data loss
2. **All Tests Pass**: 80%+ coverage, all CI checks green
3. **Features Working**: All user stories verified via E2E tests
4. **Performance Met**: Response times under 200ms (95th percentile)
5. **Documentation Complete**: All APIs documented, README updated, ADRs written

---

## Key Entities

### User (from Clerk)
- `id`: Clerk user ID
- `email`: User email
- `username`: Unique username
- `full_name`: Display name
- `avatar_url`: Profile image URL
- `role`: "buyer" | "seller" | "admin"
- `created_at`: Account creation timestamp

### Product
- `id`: UUID
- `title`: Product name
- `description`: Full description
- `price`: Decimal price
- `category_id`: FK to Category
- `seller_id`: FK to User
- `status`: "draft" | "published" | "archived"
- `product_type`: "digital_download" | "subscription"
- `created_at`, `updated_at`: Timestamps

### Cart
- `id`: UUID
- `user_id`: FK to User (nullable for guests)
- `session_id`: Session identifier (for guests)
- `created_at`, `updated_at`: Timestamps

### CartItem
- `id`: UUID
- `cart_id`: FK to Cart
- `product_id`: FK to Product
- `quantity`: Integer
- `added_at`: Timestamp

### Message
- `id`: UUID
- `sender_id`: FK to User
- `recipient_id`: FK to User
- `product_id`: FK to Product (optional, for context)
- `content`: Message text
- `read_at`: Timestamp or null
- `created_at`: Timestamp

### Review
- `id`: UUID
- `product_id`: FK to Product
- `user_id`: FK to User
- `purchase_id`: FK to Purchase (verified purchase)
- `rating`: Integer 1-5
- `content`: Review text
- `status`: "pending" | "approved" | "rejected"
- `created_at`, `updated_at`: Timestamps

### AnalyticsEvent
- `id`: UUID
- `event_type`: "page_view" | "purchase" | "cart_add" | etc.
- `user_id`: FK to User (nullable)
- `product_id`: FK to Product (nullable)
- `metadata`: JSONB
- `created_at`: Timestamp

---

## Out of Scope

- Payment provider migration (keeping Lemon Squeezy)
- Authentication provider migration (keeping Clerk)
- Image storage migration (evaluate later - may use S3/MinIO)
- Email service integration
- Push notifications

---

## Dependencies

- PostgreSQL 15+ (Docker container)
- PgBouncer for connection pooling
- Alembic for migrations
- pytest for backend testing
- Vitest + Playwright for frontend testing

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss during migration | High | Low | Full backup, staged migration, rollback plan |
| Connection pool exhaustion | High | Medium | PgBouncer with proper limits, monitoring |
| Breaking existing auth flows | High | Medium | Thorough testing, gradual rollout |
| Performance regression | Medium | Medium | Benchmark before/after, query analysis |
| Extended downtime | High | Low | Zero-downtime migration strategy |

---

## Timeline Estimate

- **Phase 1**: PostgreSQL setup & migration scripts (1-2 days)
- **Phase 2**: Auth integration & profile sync (1 day)
- **Phase 3**: Missing features implementation (3-4 days)
- **Phase 4**: Testing infrastructure (2 days)
- **Phase 5**: Polish & deployment (1-2 days)

**Total**: 8-11 days
