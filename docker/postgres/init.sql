-- HEKKA MARKET PostgreSQL Initialization
-- This script runs on first container startup

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For trigram similarity search

-- Set timezone
SET timezone = 'UTC';

-- Create schemas (optional, using public for now)
-- CREATE SCHEMA IF NOT EXISTS hekka;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE hekka_market TO hekka;
GRANT ALL PRIVILEGES ON SCHEMA public TO hekka;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hekka;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hekka;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hekka;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hekka;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'HEKKA MARKET database initialized successfully';
END $$;
