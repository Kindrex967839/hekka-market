# ADR-001: Migration from Supabase to Self-Hosted PostgreSQL

## Status

Proposed

## Context

HEKKA MARKET currently uses Supabase for:
- PostgreSQL database (managed)
- Row Level Security policies
- Storage (product images)
- Real-time subscriptions (unused)

This creates:
1. **Vendor Lock-in**: Data and schema tied to Supabase-specific features
2. **Cost Concerns**: Managed service pricing scales with usage
3. **Limited Control**: Cannot customize PostgreSQL configuration
4. **Authentication Overlap**: Clerk handles auth, Supabase auth unused

## Decision

We will migrate from Supabase to self-hosted PostgreSQL running in Docker containers with:
- PostgreSQL 15+ for database
- PgBouncer for connection pooling
- Alembic for migrations
- Docker Compose for local development

Keep the following unchanged:
- **Clerk** for authentication (JWT validation)
- **Lemon Squeezy** for payments
- **Supabase Storage** temporarily (migrate to MinIO/S3 later)

## Consequences

### Positive
- Full control over database configuration
- No vendor lock-in for core data
- Lower operational costs at scale
- Custom indexing and query optimization
- Portable infrastructure (Docker)

### Negative
- Increased operational complexity
- Self-managed backups and monitoring
- Need to implement application-level auth (replacing RLS)
- Additional deployment considerations

### Neutral
- Same PostgreSQL version compatibility
- Same data model (minimal schema changes)
- Same API surface

## Implementation

### Phase 1: Infrastructure Setup
- Docker Compose with PostgreSQL + PgBouncer
- Alembic migrations framework
- Connection pooling in FastAPI

### Phase 2: Data Migration
- Export script for Supabase data
- Import script with validation
- Zero-downtime migration strategy

### Phase 3: Application Updates
- Replace Supabase client with SQLAlchemy
- Implement Clerk JWT validation
- Update frontend API calls

### Phase 4: Feature Completion
- Shopping cart
- Direct messaging
- Reviews system
- Analytics dashboard
- Admin dashboard

## Alternatives Considered

1. **Stay on Supabase**: Rejected due to vendor lock-in and cost
2. **Use managed PostgreSQL (AWS RDS, etc.)**: Rejected due to cost and complexity
3. **Use SQLite for development**: Rejected - need production parity
4. **Use MongoDB/NoSQL**: Rejected - relational data fits SQL model better

## References

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL 15 Release Notes](https://www.postgresql.org/about/news/postgresql-15-released-2526/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [PgBouncer Features](https://www.pgbouncer.org/features.html)

## Date

2026-03-29
