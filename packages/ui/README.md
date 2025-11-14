# @coforma/ui

Shared UI components for Coforma Studio.

## Stack

- **Base**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Components

This package contains reusable UI components that can be shared across multiple frontends (web, mobile, etc.).

### Component Categories

- **Primitives**: Button, Input, Select, etc. (from shadcn/ui)
- **Composed**: DataTable, FormField, Modal, etc.
- **Domain**: CABCard, SessionCard, FeedbackItem, etc.

## Usage

```typescript
import { Button, Input } from '@coforma/ui';
import { CABCard } from '@coforma/ui/domain';
```

## Development

```bash
# Build UI package
pnpm --filter=ui build

# Run Storybook (component explorer)
pnpm --filter=ui storybook

# Build Storybook
pnpm --filter=ui build-storybook
```

## Adding Components

Use shadcn/ui CLI to add new components:

```bash
npx shadcn-ui@latest add button
```

Components will be added to `src/components/ui/`.
