# @coforma/types

Shared TypeScript types and interfaces for Coforma Studio.

## Purpose

This package contains:
- Shared type definitions
- Zod schemas (for validation)
- Utility types
- Constants and enums

## Usage

```typescript
import { User, TenantRole } from '@coforma/types';
import { userSchema } from '@coforma/types/schemas';
```

## Development

Types are automatically generated from:
1. Prisma schema (via `prisma generate`)
2. tRPC router (inferred types)
3. Manual type definitions in `src/`

## Building

```bash
# Build types package
pnpm --filter=types build

# Type check
pnpm --filter=types typecheck
```
