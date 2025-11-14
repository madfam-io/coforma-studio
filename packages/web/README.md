# @coforma/web

Next.js frontend application for Coforma Studio.

## Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand + TanStack Query
- **Auth**: NextAuth.js v5
- **Forms**: React Hook Form + Zod

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
