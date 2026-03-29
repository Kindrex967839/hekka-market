# HEKKA MARKET Constitution

## Governing Principles

### 1. Data Sovereignty & Control
- All data must reside within infrastructure we control
- No vendor lock-in for core database infrastructure
- Migrations must be reversible with zero data loss
- Connection pooling and failover must be built-in

### 2. Code Quality Standards
- TypeScript strict mode enabled
- Python type hints required for all functions
- 80% minimum test coverage for new code
- No `any` types without explicit justification
- All API endpoints must have input validation (Zod/Pydantic)

### 3. Security Requirements
- All secrets via environment variables (never in code)
- JWT tokens must have expiration and refresh mechanism
- Database credentials rotated on schedule
- RLS policies replaced with proper application-level auth
- All API endpoints authenticated unless explicitly public

### 4. Performance Standards
- API response time < 200ms for 95th percentile
- Database queries must use indexes (EXPLAIN ANALYZE required)
- N+1 queries forbidden
- Images optimized and served via CDN or efficient storage
- Connection pooling mandatory (PgBouncer or similar)

### 5. Testing Requirements
- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Test database separate from development
- Migrations tested in CI before deployment

### 6. Documentation Standards
- All API endpoints documented (OpenAPI spec)
- Database schema documented with comments
- README updated for all environment changes
- ADRs (Architecture Decision Records) for major decisions

### 7. Operational Readiness
- Health check endpoints required
- Graceful shutdown on SIGTERM
- Structured logging (JSON format)
- Metrics exposed for monitoring
- Backup and restore procedures documented

### 8. Development Workflow
- No direct commits to main branch
- All changes via pull request
- CI must pass before merge
- Database changes via migrations only
- No manual database modifications

## Non-Goals
- Mobile applications (web-first)
- Real-time collaboration features
- Internationalization (English only for now)
- Blockchain/Web3 features
