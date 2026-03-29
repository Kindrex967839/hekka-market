# Tasks: PostgreSQL Migration & Feature Completion

**Feature ID**: 001  
**Status**: Not Started  
**Created**: 2026-03-29

---

## Legend
- `[ ]` Not started
- `[x]` Completed
- `[~]` In progress
- `[!]` Blocked

---

## Phase 1: Foundation & Database Setup

### T001 [P?] Setup Docker Infrastructure
- [ ] T001.1 Create `docker/docker-compose.yml` with PostgreSQL 15 service
- [ ] T001.2 Add PgBouncer service to docker-compose
- [ ] T001.3 Create `docker/postgres/init.sql` for initial database setup
- [ ] T001.4 Configure PgBouncer in `docker/pgbouncer/pgbouncer.ini`
- [ ] T001.5 Add `.env.example` with database connection variables
- [ ] T001.6 Test containers start with `docker-compose up`

### T002 [P?] Configure Backend Database Connection
- [ ] T002.1 Add SQLAlchemy, asyncpg, alembic to `backend/requirements.txt`
- [ ] T002.2 Create `backend/app/core/config.py` with Pydantic settings
- [ ] T002.3 Create `backend/app/core/database.py` with async engine setup
- [ ] T002.4 Update `backend/main.py` to use new database connection
- [ ] T002.5 Test connection with simple query on startup

### T003 [P?] Setup Alembic Migrations
- [ ] T003.1 Initialize Alembic in backend: `alembic init alembic`
- [ ] T003.2 Configure `alembic/env.py` for async migrations
- [ ] T003.3 Create `alembic.ini` with proper settings
- [ ] T003.4 Create initial migration: profiles, categories tables
- [ ] T003.5 Create migration: products, product_images tables
- [ ] T003.6 Create migration: messages, purchases tables
- [ ] T003.7 Create migration: cart, cart_items tables (new)
- [ ] T003.8 Create migration: reviews, analytics_events tables (new)
- [ ] T003.9 Test migrations: `alembic upgrade head`

### T004 [P?] Create SQLAlchemy Models
- [ ] T004.1 Create `backend/app/models/__init__.py`
- [ ] T004.2 Create `backend/app/models/user.py` (User, Profile)
- [ ] T004.3 Create `backend/app/models/product.py` (Product, ProductImage, Category)
- [ ] T004.4 Create `backend/app/models/cart.py` (Cart, CartItem)
- [ ] T004.5 Create `backend/app/models/message.py` (Message, Conversation)
- [ ] T004.6 Create `backend/app/models/review.py` (Review)
- [ ] T004.7 Create `backend/app/models/analytics.py` (AnalyticsEvent)
- [ ] T004.8 Create `backend/app/models/purchase.py` (Purchase, Subscription)

### T005 [P?] Implement Health Check & Logging
- [ ] T005.1 Create `/health` endpoint in `backend/app/api/v1/endpoints/health.py`
- [ ] T005.2 Add database connectivity check to health endpoint
- [ ] T005.3 Configure structured JSON logging in `backend/app/core/logging.py`
- [ ] T005.4 Add request ID middleware for tracing
- [ ] T005.5 Implement graceful shutdown handler
- [ ] T005.6 Test health endpoint returns correct status

---

## Phase 2: Data Migration & Auth Integration

### T006 [P?] Create Data Export Script
- [ ] T006.1 Create `backend/scripts/export_supabase.py`
- [ ] T006.2 Implement profiles table export to JSON
- [ ] T006.3 Implement categories table export to JSON
- [ ] T006.4 Implement products table export to JSON
- [ ] T006.5 Implement product_images table export to JSON
- [ ] T006.6 Implement messages table export to JSON
- [ ] T006.7 Implement purchases table export to JSON
- [ ] T006.8 Add validation and error handling
- [ ] T006.9 Test export script against Supabase

### T007 [P?] Create Data Import Script
- [ ] T007.1 Create `backend/scripts/import_to_postgres.py`
- [ ] T007.2 Implement profiles import with deduplication
- [ ] T007.3 Implement categories import
- [ ] T007.4 Implement products import with FK validation
- [ ] T007.5 Implement product_images import
- [ ] T007.6 Implement messages import
- [ ] T007.7 Implement purchases import
- [ ] T007.8 Add transaction support for rollback on error
- [ ] T007.9 Add data integrity validation post-import
- [ ] T007.10 Test import script with exported data

### T008 [P?] Implement Clerk JWT Validation
- [ ] T008.1 Create `backend/app/core/security.py`
- [ ] T008.2 Implement JWT token validation using Clerk's JWKS
- [ ] T008.3 Create `backend/app/api/deps.py` with get_current_user dependency
- [ ] T008.4 Create `backend/app/schemas/user.py` with UserResponse schema
- [ ] T008.5 Add authentication middleware to protected routes
- [ ] T008.6 Handle token expiration and refresh
- [ ] T008.7 Write tests for JWT validation

### T009 [P?] Update User Profile Sync
- [ ] T009.1 Create `backend/app/services/auth_service.py`
- [ ] T009.2 Implement `sync_user_profile()` function
- [ ] T009.3 Create `/api/v1/auth/sync` endpoint
- [ ] T009.4 Update frontend `ClerkSupabaseIntegration.tsx` to call sync
- [ ] T009.5 Handle username generation from Clerk data
- [ ] T009.6 Write tests for profile sync

### T010 [P?] Replace Supabase Client in Backend
- [ ] T010.1 Remove `backend/database.py` Supabase client
- [ ] T010.2 Update `backend/routes/webhooks.py` to use SQLAlchemy
- [ ] T010.3 Update webhook handlers to use new models
- [ ] T010.4 Test webhook handling with PostgreSQL
- [ ] T010.5 Remove supabase from requirements.txt

### T011 [P?] Replace Supabase Client in Frontend
- [ ] T011.1 Create `frontend/src/api/client.ts` with HTTP client
- [ ] T011.2 Create `frontend/src/api/products.ts` API functions
- [ ] T011.3 Create `frontend/src/api/auth.ts` API functions
- [ ] T011.4 Update `frontend/src/utils/supabaseUtils.ts` to use new API
- [ ] T011.5 Update all components to use new API client
- [ ] T011.6 Remove `@supabase/supabase-js` dependency
- [ ] T011.7 Test all existing features work

### T012 [P?] Validate Migration
- [ ] T012.1 Run row count comparison between Supabase and PostgreSQL
- [ ] T012.2 Validate all foreign key relationships intact
- [ ] T012.3 Test all existing API endpoints
- [ ] T012.4 Test all existing frontend features
- [ ] T012.5 Document migration completion in ADR

---

## Phase 3: Missing Features - Cart & Messages

### T013 [US-005] Implement Cart API
- [ ] T013.1 Create `backend/app/schemas/cart.py` with CartSchemas
- [ ] T013.2 Create `backend/app/services/cart_service.py`
- [ ] T013.3 Implement `get_cart(user_id)` service function
- [ ] T013.4 Implement `add_to_cart(user_id, product_id, quantity)`
- [ ] T013.5 Implement `remove_from_cart(user_id, item_id)`
- [ ] T013.6 Implement `update_quantity(user_id, item_id, quantity)`
- [ ] T013.7 Implement `merge_guest_cart(user_id, session_id)`
- [ ] T013.8 Create `backend/app/api/v1/endpoints/cart.py` endpoints
- [ ] T013.9 Write unit tests for cart service
- [ ] T013.10 Write integration tests for cart API

### T014 [US-005] Build Cart UI
- [ ] T014.1 Create `frontend/src/stores/cartStore.ts` Zustand store
- [ ] T014.2 Create `frontend/src/hooks/useCart.ts` hook
- [ ] T014.3 Create `frontend/src/api/cart.ts` API functions
- [ ] T014.4 Create `frontend/src/components/CartWidget.tsx` header icon
- [ ] T014.5 Create `frontend/src/pages/Cart.tsx` cart page
- [ ] T014.6 Add cart route to `frontend/src/user-routes.tsx`
- [ ] T014.7 Add "Add to Cart" button to ProductDetails page
- [ ] T014.8 Implement quantity adjustment in cart
- [ ] T014.9 Add cart persistence for guest users
- [ ] T014.10 Test cart functionality E2E

### T015 [US-004] Implement Messages API
- [ ] T015.1 Create `backend/app/schemas/message.py` with MessageSchemas
- [ ] T015.2 Create `backend/app/services/message_service.py`
- [ ] T015.3 Implement `get_conversations(user_id)`
- [ ] T015.4 Implement `get_messages(user_id, other_user_id)`
- [ ] T015.5 Implement `send_message(sender_id, recipient_id, content)`
- [ ] T015.6 Implement `mark_as_read(user_id, message_id)`
- [ ] T015.7 Implement `get_unread_count(user_id)`
- [ ] T015.8 Create `backend/app/api/v1/endpoints/messages.py`
- [ ] T015.9 Write unit tests for message service
- [ ] T015.10 Write integration tests for messages API

### T016 [US-004] Build Messages UI
- [ ] T016.1 Create `frontend/src/stores/messageStore.ts` Zustand store
- [ ] T016.2 Create `frontend/src/hooks/useMessages.ts` hook
- [ ] T016.3 Create `frontend/src/api/messages.ts` API functions
- [ ] T016.4 Create `frontend/src/components/MessageBadge.tsx` unread indicator
- [ ] T016.5 Create `frontend/src/pages/Messages.tsx` inbox page
- [ ] T016.6 Create `frontend/src/pages/Conversation.tsx` thread page
- [ ] T016.7 Add message routes to `frontend/src/user-routes.tsx`
- [ ] T016.8 Add "Message Seller" button to ProductDetails
- [ ] T016.9 Implement message polling for updates
- [ ] T016.10 Test messaging functionality E2E

---

## Phase 4: Missing Features - Reviews & Analytics

### T017 [US-007] Implement Reviews API
- [ ] T017.1 Create `backend/app/schemas/review.py` with ReviewSchemas
- [ ] T017.2 Create `backend/app/services/review_service.py`
- [ ] T017.3 Implement `get_reviews(product_id, filters)`
- [ ] T017.4 Implement `create_review(user_id, review_data)`
- [ ] T017.5 Implement `update_review(user_id, review_id, data)`
- [ ] T017.6 Implement `moderate_review(admin_id, review_id, status)`
- [ ] T017.7 Implement `can_review(user_id, product_id)` purchase check
- [ ] T017.8 Create `backend/app/api/v1/endpoints/reviews.py`
- [ ] T017.9 Write unit tests for review service
- [ ] T017.10 Write integration tests for reviews API

### T018 [US-007] Build Reviews UI
- [ ] T018.1 Create `frontend/src/api/reviews.ts` API functions
- [ ] T018.2 Create `frontend/src/components/ReviewList.tsx`
- [ ] T018.3 Create `frontend/src/components/ReviewForm.tsx`
- [ ] T018.4 Add review summary to ProductDetails page
- [ ] T018.5 Add review list to ProductDetails page
- [ ] T018.6 Add "Leave Review" button for purchased items
- [ ] T018.7 Implement star rating input
- [ ] T018.8 Add review moderation for admins
- [ ] T018.9 Test review functionality E2E

### T019 [US-006] Implement Analytics API
- [ ] T019.1 Create `backend/app/schemas/analytics.py`
- [ ] T019.2 Create `backend/app/services/analytics_service.py`
- [ ] T019.3 Implement `track_event(event_type, user_id, metadata)`
- [ ] T019.4 Implement `get_seller_analytics(seller_id, date_range)`
- [ ] T019.5 Implement `get_product_analytics(product_id, date_range)`
- [ ] T019.6 Implement `get_platform_analytics(admin_id, date_range)`
- [ ] T019.7 Create `backend/app/api/v1/endpoints/analytics.py`
- [ ] T019.8 Add event tracking to product view endpoint
- [ ] T019.9 Add event tracking to purchase webhook
- [ ] T019.10 Write tests for analytics service

### T020 [US-006] Build Analytics Dashboard
- [ ] T020.1 Create `frontend/src/api/analytics.ts` API functions
- [ ] T020.2 Create `frontend/src/hooks/useAnalytics.ts` hook
- [ ] T020.3 Create `frontend/src/pages/Analytics.tsx` dashboard
- [ ] T020.4 Add sales over time chart
- [ ] T020.5 Add revenue breakdown by product
- [ ] T020.6 Add conversion metrics
- [ ] T020.7 Add date range filter
- [ ] T020.8 Add analytics route to seller dashboard
- [ ] T020.9 Test analytics dashboard

---

## Phase 5: Search & Admin

### T021 [US-008] Implement Advanced Search
- [ ] T021.1 Add tsvector column to products table via migration
- [ ] T021.2 Create trigger to update tsvector on product changes
- [ ] T021.3 Add search indexes to products table
- [ ] T021.4 Create `backend/app/services/search_service.py`
- [ ] T021.5 Implement full-text search with ranking
- [ ] T021.6 Implement filter by price range
- [ ] T021.7 Implement filter by category
- [ ] T021.8 Implement filter by product type
- [ ] T021.9 Implement sorting (relevance, price, date)
- [ ] T021.10 Create search endpoint in API
- [ ] T021.11 Write tests for search functionality

### T022 [US-008] Build Advanced Search UI
- [ ] T022.1 Create `frontend/src/components/SearchFilters.tsx`
- [ ] T022.2 Add price range slider
- [ ] T022.3 Add category dropdown
- [ ] T022.4 Add product type toggle
- [ ] T022.5 Add sort dropdown
- [ ] T022.6 Update Explore page to use new search
- [ ] T022.7 Implement debounced search input
- [ ] T022.8 Add filter persistence in URL params
- [ ] T022.9 Test search functionality E2E

### T023 [US-012] Implement Admin API
- [ ] T023.1 Add admin role check to auth dependency
- [ ] T023.2 Create `backend/app/services/admin_service.py`
- [ ] T023.3 Implement `get_platform_stats()`
- [ ] T023.4 Implement `list_users(filters, pagination)`
- [ ] T023.5 Implement `suspend_user(admin_id, user_id)`
- [ ] T023.6 Implement `list_flagged_content()`
- [ ] T023.7 Implement `moderate_content(admin_id, action)`
- [ ] T023.8 Create `backend/app/api/v1/endpoints/admin.py`
- [ ] T023.9 Write tests for admin functionality

### T024 [US-012] Build Admin Dashboard
- [ ] T024.1 Create `frontend/src/pages/Admin.tsx` dashboard
- [ ] T024.2 Add platform overview metrics
- [ ] T024.3 Add user management table
- [ ] T024.4 Add content moderation queue
- [ ] T024.5 Add review moderation section
- [ ] T024.6 Add admin route with protection
- [ ] T024.7 Test admin functionality E2E

---

## Phase 6: Testing Infrastructure

### T025 [P?] Setup Backend Testing
- [ ] T025.1 Configure pytest in `backend/pyproject.toml`
- [ ] T025.2 Create `backend/tests/conftest.py` with fixtures
- [ ] T025.3 Create test database fixture
- [ ] T025.4 Create authenticated client fixture
- [ ] T025.5 Configure pytest-asyncio
- [ ] T025.6 Configure pytest-cov for coverage
- [ ] T025.7 Add test running to Makefile

### T026 [P?] Setup Frontend Testing
- [ ] T026.1 Configure Vitest in `frontend/vite.config.ts`
- [ ] T026.2 Create `frontend/src/test/setup.ts`
- [ ] T026.3 Configure Playwright in `frontend/playwright.config.ts`
- [ ] T026.4 Create test utilities and mocks
- [ ] T026.5 Setup MSW for API mocking
- [ ] T026.6 Add test scripts to package.json

### T027 [P?] Write Unit Tests
- [ ] T027.1 Write tests for `backend/app/services/cart_service.py`
- [ ] T027.2 Write tests for `backend/app/services/message_service.py`
- [ ] T027.3 Write tests for `backend/app/services/review_service.py`
- [ ] T027.4 Write tests for `backend/app/services/analytics_service.py`
- [ ] T027.5 Write tests for `backend/app/services/search_service.py`
- [ ] T027.6 Write tests for frontend stores
- [ ] T027.7 Write tests for frontend hooks

### T028 [P?] Write Integration Tests
- [ ] T028.1 Write tests for cart API endpoints
- [ ] T028.2 Write tests for messages API endpoints
- [ ] T028.3 Write tests for reviews API endpoints
- [ ] T028.4 Write tests for analytics API endpoints
- [ ] T028.5 Write tests for search API endpoints
- [ ] T028.6 Write tests for admin API endpoints

### T029 [P?] Write E2E Tests
- [ ] T029.1 Write E2E test for user authentication flow
- [ ] T029.2 Write E2E test for product browsing
- [ ] T029.3 Write E2E test for cart and checkout
- [ ] T029.4 Write E2E test for messaging flow
- [ ] T029.5 Write E2E test for reviews
- [ ] T029.6 Write E2E test for seller dashboard
- [ ] T029.7 Write E2E test for admin dashboard

### T030 [P?] Configure CI Pipeline
- [ ] T030.1 Create `.github/workflows/test.yml`
- [ ] T030.2 Add backend test job
- [ ] T030.3 Add frontend test job
- [ ] T030.4 Add E2E test job
- [ ] T030.5 Add coverage reporting
- [ ] T030.6 Add lint/type check job
- [ ] T030.7 Configure branch protection rules

---

## Phase 7: Polish & Deployment

### T031 [US-009] Implement Error Handling
- [ ] T031.1 Create `backend/app/core/exceptions.py` custom exceptions
- [ ] T031.2 Create `backend/app/api/exception_handlers.py`
- [ ] T031.3 Implement global exception handler
- [ ] T031.4 Create structured error responses
- [ ] T031.5 Create `frontend/src/components/ErrorBoundary.tsx`
- [ ] T031.6 Add error boundary to app root
- [ ] T031.7 Create `frontend/src/utils/errorHandler.ts`
- [ ] T031.8 Add toast notifications for errors
- [ ] T031.9 Test error scenarios

### T032 [US-011] Improve Mobile Responsiveness
- [ ] T032.1 Audit current mobile issues
- [ ] T032.2 Fix navigation mobile menu
- [ ] T032.3 Fix product cards on mobile
- [ ] T032.4 Fix product details on mobile
- [ ] T032.5 Fix cart page on mobile
- [ ] T032.6 Fix messaging on mobile
- [ ] T032.7 Add touch-friendly interactions
- [ ] T032.8 Test on multiple device sizes

### T033 [P?] Add Loading States
- [ ] T033.1 Create skeleton components
- [ ] T033.2 Add skeleton to product cards
- [ ] T033.3 Add skeleton to product details
- [ ] T033.4 Add skeleton to cart page
- [ ] T033.5 Add skeleton to messages
- [ ] T033.6 Add loading spinners to buttons
- [ ] T033.7 Add optimistic updates where appropriate

### T034 [P?] Documentation
- [ ] T034.1 Generate OpenAPI schema from FastAPI
- [ ] T034.2 Create API documentation page
- [ ] T034.3 Add database schema documentation
- [ ] T034.4 Write ADR for PostgreSQL migration
- [ ] T034.5 Update README.md with new setup
- [ ] T034.6 Create deployment guide
- [ ] T034.7 Create backup/restore procedures

### T035 [P?] Monitoring Setup
- [ ] T035.1 Add Prometheus metrics endpoint
- [ ] T035.2 Track key business metrics
- [ ] T035.3 Configure log aggregation
- [ ] T035.4 Set up error tracking (Sentry)
- [ ] T035.5 Create monitoring dashboard
- [ ] T035.6 Configure alerts

---

## Task Summary

| Phase | Tasks | Est. Time |
|-------|-------|-----------|
| 1. Foundation | T001-T005 | 1-2 days |
| 2. Migration & Auth | T006-T012 | 1-2 days |
| 3. Cart & Messages | T013-T016 | 2 days |
| 4. Reviews & Analytics | T017-T020 | 2 days |
| 5. Search & Admin | T021-T024 | 1-2 days |
| 6. Testing | T025-T030 | 2 days |
| 7. Polish | T031-T035 | 1-2 days |

**Total**: 35 tasks, ~10-13 days

---

## Dependencies Between Tasks

```
T001 (Docker) → T002 (Connection) → T003 (Alembic) → T004 (Models)
                                        ↓
                              T005 (Health) → T006 (Export)
                                        ↓
                              T007 (Import) → T008 (JWT)
                                        ↓
                              T009 (Profile Sync) → T010 (Backend)
                                        ↓
                              T011 (Frontend) → T012 (Validation)

T004 (Models) → T013 (Cart API) → T014 (Cart UI)
              → T015 (Messages API) → T016 (Messages UI)
              → T017 (Reviews API) → T018 (Reviews UI)
              → T019 (Analytics API) → T020 (Analytics UI)

T013-T020 → T021 (Search) → T022 (Search UI)
          → T023 (Admin API) → T024 (Admin UI)

T013-T024 → T025 (Backend Tests)
          → T026 (Frontend Tests) → T027 (Unit) → T028 (Integration) → T029 (E2E)
                                                            ↓
                                                      T030 (CI)

All → T031 (Error Handling) → T032 (Mobile) → T033 (Loading) → T034 (Docs) → T035 (Monitoring)
```
