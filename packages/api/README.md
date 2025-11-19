# @coforma/api

NestJS backend API for Coforma Studio.

**📊 Current Status:** Foundation complete, core features in development

## Stack

- **Framework**: NestJS 10+
- **API**: tRPC (type-safe) + REST
- **ORM**: Prisma 5+ with PostgreSQL 15+
- **Queue**: BullMQ with Redis
- **Auth**: NextAuth.js integration
- **Security**: Row-Level Security (RLS) for multi-tenancy

## Development

```bash
# Install dependencies (from root)
pnpm install

# Run database migrations
pnpm --filter=api prisma migrate dev

# Seed database
pnpm --filter=api prisma db seed

# Run development server
pnpm --filter=api dev

# Build for production
pnpm --filter=api build

# Run tests
pnpm --filter=api test
```

## Environment Variables

See `.env.example` in the root directory.

Required variables:
- `DATABASE_URL`
- `REDIS_URL`
- `NEXTAUTH_SECRET`
- `STRIPE_SECRET_KEY`

## Database

PostgreSQL with Prisma ORM. Schema located in `prisma/schema.prisma`.

### Migrations

```bash
# Create new migration
pnpm --filter=api prisma migrate dev --name migration_name

# Deploy migrations (production)
pnpm --filter=api prisma migrate deploy

# Reset database (WARNING: deletes all data)
pnpm --filter=api prisma migrate reset
```

## Testing

```bash
# Run all tests
pnpm --filter=api test

# Run tests in watch mode
pnpm --filter=api test:watch

# Run with coverage
pnpm --filter=api test:cov

# Run specific test file
pnpm --filter=api vitest run test/rls/tenant-isolation.test.ts
```

See [test/README.md](./test/README.md) for comprehensive testing documentation.

## Deployment

Deployed to Railway via GitHub integration.

- **Production**: `main` branch
- **Staging**: `develop` branch

## Documentation

- [Test Guide](./test/README.md) - How to run and write tests
- [Project Status](/PROJECT_STATUS.md) - Current implementation status
- [RLS Implementation](/RLS_IMPLEMENTATION_SUMMARY.md) - Multi-tenant security
- [API Specification](/docs/api-specification.md) - API documentation
