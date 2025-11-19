# @coforma/web

Next.js frontend application for Coforma Studio.

**📊 Current Status:** Basic pages implemented, tRPC integration in progress

## Stack

- **Framework**: Next.js 15+ (App Router with React Server Components)
- **Styling**: Tailwind CSS + shadcn/ui compatible
- **State**: Zustand + TanStack Query v5
- **Auth**: NextAuth.js v5
- **Forms**: React Hook Form + Zod validation
- **API**: tRPC for type-safe backend calls

## Development

```bash
# Install dependencies (from root)
pnpm install

# Run development server
pnpm --filter=web dev

# Build for production
pnpm --filter=web build

# Run tests
pnpm --filter=web test
```

## Environment Variables

See `.env.example` in the root directory.

Required variables:
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_API_URL`

## Deployment

Deployed to Vercel via GitHub integration.

- **Production**: `main` branch → `coforma.studio`
- **Staging**: `develop` branch → `stage.coforma.studio`
- **Preview**: Pull requests → `pr-*.vercel.app`

## Documentation

- [Project Status](/PROJECT_STATUS.md) - Current implementation status
- [API Specification](/docs/api-specification.md) - API documentation
- [Contributing Guide](/CONTRIBUTING.md) - Development workflow
