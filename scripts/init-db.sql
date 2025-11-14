-- Initialize PostgreSQL database for Coforma Studio
-- This script runs on first startup of the PostgreSQL container

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create initial database user (if needed for multi-database setup)
-- Note: In development, we use the default 'postgres' user

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE coforma_dev TO postgres;

-- Output confirmation
SELECT 'Coforma Studio database initialized successfully' AS status;
