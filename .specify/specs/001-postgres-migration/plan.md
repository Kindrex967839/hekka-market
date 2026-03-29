# Implementation Plan: PostgreSQL Migration & Feature Completion

**Feature ID**: 001  
**Status**: Draft  
**Created**: 2026-03-29

---

## Technical Context

### Languages & Runtimes
- **Frontend**: TypeScript 5.2+, React 18.2, Node 18+
- **Backend**: Python 3.11+, FastAPI 0.111+

### Frameworks & Libraries
- **Frontend**: Vite, React Router, React Query, React Hook Form, Zod, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, SQLAlchemy 2.0, Alembic, Pydantic, asyncpg

### Data Storage
- **Primary Database**: PostgreSQL 15+ (Docker container)
- **Connection Pooling**: PgBouncer
- **File Storage**: Supabase Storage (migrate to MinIO/S3 in future phase)
- **Cache**: Redis (optional, for sessions/analytics)

### APIs & Integrations
- **Authentication**: Clerk (JWT validation)
- **Payments**: Lemon Squeezy (webhooks)
- **Search**: PostgreSQL full-text search (tsvector)

### Infrastructure
- **Containers**: Docker Compose for local development
- **Migrations**: Alembic for schema management
- **Testing**: pytest (backend), Vitest + Playwright (frontend)
- **Logging**: Structured JSON logging

---

## Project Structure

```
hekka-market/
├── docker/
│   ├── docker-compose.yml          # PostgreSQL + PgBouncer + Redis
│   ├── postgres/
│   │   └── init.sql                # Initial database setup
│   └── pgbouncer/
│       └── pgbouncer.ini           # Connection pool config
│
├── backend/
│   ├── alembic/                    # Database migrations
│   │   ├── versions/
│   │   ├── env.py
│   │   └── alembic.ini
│   ├── app/
│   │   ├── models/                 # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── product.py
│   │   │   ├── cart.py
│   │   │   ├── message.py
│   │   │   ├── review.py
│   │   │   └── analytics.py
│   │   ├── schemas/                # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── product.py
│   │   │   ├── cart.py
│   │   │   ├── message.py
│   │   │   └── review.py
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── auth.py
│   │   │   │   │   ├── products.py
│   │   │   │   │   ├── cart.py
│   │   │   │   │   ├── messages.py
│   │   │   │   │   ├── reviews.py
│   │   │   │   │   ├── analytics.py
│   │   │   │   │   └── admin.py
│   │   │   │   └── router.py
│   │   │   └── deps.py             # Dependencies (DB session, auth)
│   │   ├── core/
│   │   │   ├── config.py           # Settings via Pydantic
│   │   │   ├── security.py         # JWT validation
│   │   │   └── database.py         # Async engine, session
│   │   ├── services/               # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── product_service.py
│   │   │   ├── cart_service.py
│   │   │   ├── message_service.py
│   │   │   └── analytics_service.py
│   │   └── main.py
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_api/
│   │   ├── test_services/
│   │   └── test_models/
│   ├── scripts/
│   │   ├── export_supabase.py      # Data export script
│   │   ├── import_to_postgres.py   # Data import script
│   │   └── seed_dev_data.py        # Development seed data
│   ├── requirements.txt
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
│   │   ├── api/                    # API client
│   │   │   ├── client.ts
│   │   │   ├── products.ts
│   │   │   ├── cart.ts
│   │   │   ├── messages.ts
│   │   │   └── reviews.ts
│   │   ├── pages/
│   │   │   ├── Cart.tsx            # NEW: Shopping cart
│   │   │   ├── Messages.tsx        # NEW: Message inbox
│   │   │   ├── Conversation.tsx    # NEW: Message thread
│   │   │   ├── Analytics.tsx       # NEW: Seller analytics
│   │   │   ├── Admin.tsx           # NEW: Admin dashboard
│   │   │   └── ...existing pages
│   │   ├── components/
│   │   │   ├── CartWidget.tsx      # NEW: Header cart icon
│   │   │   ├── MessageBadge.tsx    # NEW: Unread message indicator
│   │   │   ├── ReviewForm.tsx      # NEW: Leave review form
│   │   │   ├── ReviewList.tsx      # NEW: Product reviews
│   │   │   ├── SearchFilters.tsx   # NEW: Advanced search
│   │   │   ├── ErrorBoundary.tsx   # NEW: Error handling
│   │   │   └── ...existing components
│   │   ├── hooks/
│   │   │   ├── useCart.ts          # NEW: Cart state
│   │   │   ├── useMessages.ts      # NEW: Messages state
│   │   │   ├── useAnalytics.ts     # NEW: Analytics data
│   │   │   └── ...existing hooks
│   │   ├── stores/                 # NEW: Zustand stores
│   │   │   ├── cartStore.ts
│   │   │   └── messageStore.ts
│   │   ├── test/                   # NEW: Test setup
│   │   │   ├── setup.ts
│   │   │   └── e2e/
│   │   └── utils/
│   │       ├── apiClient.ts        # UPDATED: New backend
│   │       └── errorHandler.ts     # NEW: Error handling
│   ├── tests/
│   │   ├── unit/
│   │   └── e2e/
│   │       ├── cart.spec.ts
│   │       ├── messages.spec.ts
│   │       └── checkout.spec.ts
│   └── ...existing config
│
├── .specify/                       # Spec-kit artifacts
├── docs/
│   ├── api/                        # NEW: OpenAPI docs
│   ├── database/                   # NEW: Schema docs
│   └── adr/                        # NEW: Architecture decisions
│       └── 001-postgres-migration.md
│
└── docker-compose.yml              # Main compose file
```

---

## Implementation Phases

### Phase 1: Foundation & Database Setup
**Goal**: PostgreSQL running in Docker, connection established, migrations framework ready

**Tasks**:
1. Create Docker Compose configuration for PostgreSQL + PgBouncer
2. Configure environment variables for database connection
3. Set up Alembic for migrations
4. Create initial migration for all tables
5. Implement database connection pooling in FastAPI
6. Create health check endpoint
7. Set up structured logging

**Deliverables**:
- Working PostgreSQL container
- Alembic migrations setup
- Database connection in FastAPI
- `/health` endpoint

### Phase 2: Data Migration & Auth Integration
**Goal**: All Supabase data migrated, Clerk auth working with PostgreSQL

**Tasks**:
1. Create Supabase data export script
2. Create PostgreSQL data import script
3. Implement Clerk JWT validation middleware
4. Update user profile sync logic
5. Replace Supabase client with SQLAlchemy queries
6. Test authentication flow end-to-end
7. Validate data integrity post-migration

**Deliverables**:
- Migration scripts (export/import)
- Clerk auth integration
- User profiles working
- All existing features working with PostgreSQL

### Phase 3: Missing Features - Cart & Messages
**Goal**: Shopping cart and direct messaging fully functional

**Tasks**:
1. Create Cart and CartItem SQLAlchemy models
2. Create Message SQLAlchemy model
3. Implement cart API endpoints (add, remove, update, list)
4. Implement message API endpoints (send, list, mark read)
5. Build Cart page and CartWidget component
6. Build Messages inbox and Conversation pages
7. Implement message polling or WebSocket updates
8. Write tests for cart and messaging

**Deliverables**:
- Cart API with tests
- Messages API with tests
- Cart UI components
- Messages UI components

### Phase 4: Missing Features - Reviews & Analytics
**Goal**: Product reviews and seller analytics dashboard

**Tasks**:
1. Create Review and AnalyticsEvent SQLAlchemy models
2. Implement reviews API (create, list, moderate)
3. Implement analytics API (events, aggregations)
4. Build ReviewForm and ReviewList components
5. Build Analytics dashboard page
6. Add event tracking to product views, purchases
7. Write tests for reviews and analytics

**Deliverables**:
- Reviews API with tests
- Analytics API with tests
- Reviews UI components
- Analytics dashboard

### Phase 5: Search & Admin
**Goal**: Advanced search and admin dashboard

**Tasks**:
1. Add tsvector column to products table
2. Create search index update trigger
3. Implement advanced search API with filters
4. Create admin role middleware
5. Implement admin API endpoints
6. Build SearchFilters component
7. Build Admin dashboard page
8. Write tests for search and admin

**Deliverables**:
- Full-text search API
- Admin API with tests
- Advanced search UI
- Admin dashboard

### Phase 6: Testing Infrastructure
**Goal**: Comprehensive test coverage with CI integration

**Tasks**:
1. Set up pytest with async support
2. Set up Vitest for frontend unit tests
3. Set up Playwright for E2E tests
4. Write unit tests for all services
5. Write API integration tests
6. Write E2E tests for critical flows
7. Configure CI pipeline
8. Add coverage reporting

**Deliverables**:
- pytest configuration
- Vitest configuration
- Playwright configuration
- 80%+ test coverage
- CI pipeline

### Phase 7: Polish & Deployment
**Goal**: Production-ready, documented, monitored

**Tasks**:
1. Add error boundaries to frontend
2. Implement global error handling
3. Add loading states and skeletons
4. Improve mobile responsiveness
5. Generate OpenAPI documentation
6. Write ADR for major decisions
7. Update README and deployment docs
8. Set up monitoring and alerting

**Deliverables**:
- Error handling throughout
- Mobile-responsive design
- Complete API documentation
- Updated README
- Monitoring dashboard

---

## Constitution Compliance Check

| Principle | Compliance |
|-----------|------------|
| Data Sovereignty | ✅ PostgreSQL in Docker, full control |
| Code Quality | ✅ TypeScript strict, Python type hints, tests |
| Security | ✅ JWT validation, env vars, app-level auth |
| Performance | ✅ Connection pooling, indexed queries, benchmarks |
| Testing | ✅ pytest, Vitest, Playwright, 80%+ coverage |
| Documentation | ✅ OpenAPI, schema docs, ADRs |
| Operational Readiness | ✅ Health checks, graceful shutdown, structured logging |
| Development Workflow | ✅ Migrations only, PR workflow, CI |

---

## Risk Mitigations

### Data Loss Prevention
- Full Supabase backup before migration
- Staged migration with validation at each step
- Rollback scripts for each migration
- Data integrity checks post-migration

### Zero Downtime Strategy
- Run PostgreSQL alongside Supabase temporarily
- Implement feature flags for database switching
- Gradual traffic shift with monitoring
- Rollback capability at each stage

### Connection Pool Management
- PgBouncer with transaction-level pooling
- Health checks on connection pool
- Circuit breaker for database failures
- Monitoring and alerting on pool metrics

---

## Dependencies to Install

### Backend (requirements.txt additions)
```
sqlalchemy[asyncio]>=2.0.0
alembic>=1.13.0
asyncpg>=0.29.0
python-dotenv>=1.0.0
httpx>=0.27.0
pytest>=8.0.0
pytest-asyncio>=0.23.0
pytest-cov>=4.1.0
```

### Frontend (package.json additions)
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@playwright/test": "^1.40.0",
    "msw": "^2.0.0"
  }
}
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p95) | <200ms | APM monitoring |
| Test Coverage | ≥80% | pytest-cov, vitest |
| Migrations Applied | All | Alembic history |
| Data Integrity | 100% | Row counts match |
| CI Pipeline | Green | GitHub Actions |
| Documentation | Complete | All endpoints documented |
