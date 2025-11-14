# @coforma/api

NestJS backend API for Coforma Studio.

## Stack

- **Framework**: NestJS 10+
- **API**: tRPC + REST
- **ORM**: Prisma
- **Queue**: BullMQ
- **Auth**: NextAuth.js integration

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

## Deployment

Deployed to Railway via GitHub integration.

- **Production**: `main` branch
- **Staging**: `develop` branch
