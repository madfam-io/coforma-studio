# Database Schema

**Coforma Studio Database Schema Documentation**

## Overview

- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5+
- **Multi-Tenancy**: Single database with Row-Level Security (RLS)
- **Schema File**: `packages/api/prisma/schema.prisma`

## Entity Relationship Diagram

```
┌─────────────┐
│   Tenant    │
└──────┬──────┘
       │
       │ 1:N
       ├──────────┬──────────┬──────────┬──────────┬──────────┐
       │          │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼          ▼
┌──────────┐ ┌───────┐ ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌─────────┐
│   User   │ │  CAB  │ │ Session │ │ Feedback │ │ ActionItem│ │ AuditLog│
│Membership│ │       │ │         │ │   Item   │ │           │ │         │
└────┬─────┘ └───┬───┘ └────┬────┘ └────┬─────┘ └───────────┘ └─────────┘
     │           │          │           │
     │ N:1       │ 1:N      │ 1:N       │ 1:N
     ▼           ▼          ▼           ▼
┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐
│  User   │ │   CAB   │ │ Session  │ │ Comment │
│         │ │Membership│ │ Attendee │ │         │
└─────────┘ └─────────┘ └──────────┘ └─────────┘
```

## Tables

### Core Tables

#### `tenants`

Top-level entity for multi-tenancy. Each tenant represents an organization using Coforma Studio.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Tenant ID |
| `slug` | TEXT | UNIQUE, NOT NULL | Subdomain slug (e.g., "acme") |
| `name` | TEXT | NOT NULL | Tenant name |
| `domain` | TEXT | UNIQUE, NULLABLE | Custom domain (e.g., "cab.acme.com") |
| `logo` | TEXT | NULLABLE | Cloudflare R2 URL |
| `brandColor` | TEXT | NULLABLE | Hex color (e.g., "#3B82F6") |
| `locale` | TEXT | NOT NULL, DEFAULT 'en' | Locale (en, es) |
| `timezone` | TEXT | NOT NULL, DEFAULT 'America/Mexico_City' | Timezone |
| `whitelabelEnabled` | BOOLEAN | NOT NULL, DEFAULT false | White-label feature flag |
| `stripeCustomerId` | TEXT | UNIQUE, NULLABLE | Stripe customer ID |
| `stripeSubscriptionId` | TEXT | UNIQUE, NULLABLE | Stripe subscription ID |
| `subscriptionStatus` | TEXT | NULLABLE | Subscription status |
| `subscriptionPlanId` | TEXT | NULLABLE | Subscription plan ID |
| `billingEmail` | TEXT | NULLABLE | Billing email |
| `currentPeriodStart` | TIMESTAMP | NULLABLE | Subscription period start |
| `currentPeriodEnd` | TIMESTAMP | NULLABLE | Subscription period end |
| `trialEnd` | TIMESTAMP | NULLABLE | Trial end date |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

**Indexes**:
- `slug` (unique)
- `domain` (unique)
- `stripeCustomerId` (unique)

---

#### `users`

Individual user accounts (can belong to multiple tenants).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | User ID |
| `email` | TEXT | UNIQUE, NOT NULL | Email address |
| `name` | TEXT | NULLABLE | Full name |
| `avatar` | TEXT | NULLABLE | Cloudflare R2 URL |
| `emailVerified` | TIMESTAMP | NULLABLE | Email verification timestamp (NextAuth) |
| `image` | TEXT | NULLABLE | OAuth provider image (NextAuth) |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

**Indexes**:
- `email` (unique)

---

#### `tenant_memberships`

User membership in a tenant with role assignment.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Membership ID |
| `tenantId` | UUID | FK → tenants.id, NOT NULL | Tenant ID |
| `userId` | UUID | FK → users.id, NOT NULL | User ID |
| `role` | ENUM | NOT NULL | Role (ADMIN, FACILITATOR, MEMBER) |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

**Indexes**:
- `(tenantId, userId)` (unique composite)
- `tenantId`
- `userId`

---

### CAB Tables

#### `cabs`

Customer Advisory Boards.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | CAB ID |
| `tenantId` | UUID | FK → tenants.id, NOT NULL | Tenant ID |
| `name` | TEXT | NOT NULL | CAB name |
| `description` | TEXT | NULLABLE | Description |
| `slug` | TEXT | NOT NULL | URL-friendly slug |
| `isActive` | BOOLEAN | NOT NULL, DEFAULT true | Active status |
| `maxMembers` | INTEGER | NULLABLE | Maximum member count |
| `requiresNDA` | BOOLEAN | NOT NULL, DEFAULT false | NDA requirement |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

**Indexes**:
- `(tenantId, slug)` (unique composite)
- `tenantId`

---

#### `cab_memberships`

User membership in a CAB with metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Membership ID |
| `cabId` | UUID | FK → cabs.id, NOT NULL | CAB ID |
| `userId` | UUID | FK → users.id, NOT NULL | User ID |
| `tags` | TEXT[] | NOT NULL, DEFAULT [] | Member tags (e.g., ["power_user"]) |
| `company` | TEXT | NULLABLE | Company name |
| `title` | TEXT | NULLABLE | Job title |
| `ndaSigned` | BOOLEAN | NOT NULL, DEFAULT false | NDA signed status |
| `ndaSignedAt` | TIMESTAMP | NULLABLE | NDA signature timestamp |
| `discountPlanId` | UUID | FK → discount_plans.id, NULLABLE | Assigned discount plan |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

**Indexes**:
- `(cabId, userId)` (unique composite)
- `cabId`
- `userId`

---

### Session Tables

#### `sessions`

CAB meetings/sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Session ID |
| `tenantId` | UUID | FK → tenants.id, NOT NULL | Tenant ID |
| `cabId` | UUID | FK → cabs.id, NOT NULL | CAB ID |
| `title` | TEXT | NOT NULL | Session title |
| `description` | TEXT | NULLABLE | Description |
| `status` | ENUM | NOT NULL, DEFAULT 'SCHEDULED' | Status (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED) |
| `scheduledAt` | TIMESTAMP | NOT NULL | Scheduled start time |
| `duration` | INTEGER | NOT NULL, DEFAULT 60 | Duration in minutes |
| `endedAt` | TIMESTAMP | NULLABLE | Actual end time |
| `meetingLink` | TEXT | NULLABLE | Zoom/Google Meet link |
| `recordingUrl` | TEXT | NULLABLE | Recording URL (R2) |
| `agendaItems` | JSON | NULLABLE | Agenda items array |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

**Indexes**:
- `tenantId`
- `cabId`
- `scheduledAt`

---

#### `session_attendees`

User attendance at sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Attendee ID |
| `sessionId` | UUID | FK → sessions.id, NOT NULL | Session ID |
| `userId` | UUID | FK → users.id, NOT NULL | User ID |
| `attended` | BOOLEAN | NOT NULL, DEFAULT false | Attendance status |
| `talkTime` | INTEGER | NULLABLE | Talk time in seconds |
| `joinedAt` | TIMESTAMP | NULLABLE | Join timestamp |
| `leftAt` | TIMESTAMP | NULLABLE | Leave timestamp |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |

**Indexes**:
- `(sessionId, userId)` (unique composite)
- `sessionId`

---

#### `session_minutes`

Meeting minutes and decisions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Minutes ID |
| `sessionId` | UUID | FK → sessions.id, UNIQUE, NOT NULL | Session ID |
| `summary` | TEXT | NOT NULL | Summary |
| `decisions` | TEXT[] | NOT NULL, DEFAULT [] | Decisions array |
| `notes` | TEXT | NULLABLE | Additional notes |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

**Indexes**:
- `sessionId` (unique)

---

### Feedback Tables

#### `feedback_items`

Customer feedback (ideas, bugs, requests, research insights).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Feedback ID |
| `tenantId` | UUID | FK → tenants.id, NOT NULL | Tenant ID |
| `cabId` | UUID | FK → cabs.id, NULLABLE | CAB ID (optional) |
| `sessionId` | UUID | FK → sessions.id, NULLABLE | Session ID (optional) |
| `userId` | UUID | FK → users.id, NOT NULL | Submitter user ID |
| `title` | TEXT | NOT NULL | Title |
| `description` | TEXT | NOT NULL | Description |
| `type` | ENUM | NOT NULL | Type (IDEA, BUG, REQUEST, RESEARCH_INSIGHT) |
| `status` | ENUM | NOT NULL, DEFAULT 'OPEN' | Status (OPEN, UNDER_REVIEW, PLANNED, IN_PROGRESS, SHIPPED, CLOSED) |
| `priority` | ENUM | NOT NULL, DEFAULT 'MEDIUM' | Priority (LOW, MEDIUM, HIGH, CRITICAL) |
| `tags` | TEXT[] | NOT NULL, DEFAULT [] | Tags array |
| `attachments` | TEXT[] | NOT NULL, DEFAULT [] | Attachment URLs (R2) |
| `externalId` | TEXT | NULLABLE | External ticket ID (Jira/Asana/ClickUp) |
| `externalProvider` | ENUM | NULLABLE | Integration provider |
| `externalUrl` | TEXT | NULLABLE | External ticket URL |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

**Indexes**:
- `tenantId`
- `cabId`
- `userId`
- `status`
- `type`

---

#### `comments`

Comments on feedback items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Comment ID |
| `feedbackItemId` | UUID | FK → feedback_items.id, NOT NULL | Feedback item ID |
| `userId` | UUID | FK → users.id, NOT NULL | User ID |
| `content` | TEXT | NOT NULL | Comment content |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

**Indexes**:
- `feedbackItemId`

---

#### `votes`

Upvotes/downvotes on feedback items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Vote ID |
| `feedbackItemId` | UUID | FK → feedback_items.id, NOT NULL | Feedback item ID |
| `userId` | UUID | FK → users.id, NOT NULL | User ID |
| `value` | INTEGER | NOT NULL | Vote value (+1 or -1) |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |

**Indexes**:
- `(feedbackItemId, userId)` (unique composite)
- `feedbackItemId`

---

### Action Item Tables

#### `action_items`

Tasks/action items from sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Action item ID |
| `tenantId` | UUID | FK → tenants.id, NOT NULL | Tenant ID |
| `sessionId` | UUID | FK → sessions.id, NULLABLE | Session ID (optional) |
| `title` | TEXT | NOT NULL | Title |
| `description` | TEXT | NULLABLE | Description |
| `status` | ENUM | NOT NULL, DEFAULT 'TODO' | Status (TODO, IN_PROGRESS, COMPLETED, CANCELLED) |
| `dueDate` | TIMESTAMP | NULLABLE | Due date |
| `completedAt` | TIMESTAMP | NULLABLE | Completion timestamp |
| `assignedToId` | UUID | FK → users.id, NULLABLE | Assigned user ID |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update timestamp |

**Indexes**:
- `tenantId`
- `sessionId`
- `assignedToId`
- `status`

---

## Multi-Tenancy & Row-Level Security (RLS)

### RLS Strategy

All tables with `tenantId` column enforce Row-Level Security:

```sql
-- Example RLS policy (applied in migrations)
ALTER TABLE cabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON cabs
  USING (tenant_id::text = current_setting('app.tenant_id', true));
```

### Setting Tenant Context

Before executing queries, set the tenant context:

```typescript
await prisma.$executeRaw`SET app.tenant_id = ${tenantId}`;
```

### RLS Testing

Critical: Test RLS policies to prevent tenant data leaks:

```typescript
// Test: User from Tenant A cannot access Tenant B's data
await prisma.$executeRaw`SET app.tenant_id = ${tenantAId}`;
const cabsA = await prisma.cab.findMany();

await prisma.$executeRaw`SET app.tenant_id = ${tenantBId}`;
const cabsB = await prisma.cab.findMany();

expect(cabsA).not.toContainEqual(expect.objectContaining({ tenantId: tenantBId }));
```

## Migrations

### Creating Migrations

```bash
# Create new migration
pnpm --filter=api prisma migrate dev --name add_xyz_table

# Deploy migrations (production)
pnpm --filter=api prisma migrate deploy
```

### Migration Files

Location: `packages/api/prisma/migrations/`

Example migration:
```
migrations/
├── 20251114000001_init/
│   └── migration.sql
├── 20251114000002_enable_rls/
│   └── migration.sql
└── migration_lock.toml
```

## Indexes

### Performance Indexes

All foreign keys have indexes by default. Additional indexes:

- `tenants.slug` (unique)
- `tenants.domain` (unique)
- `users.email` (unique)
- `sessions.scheduledAt` (for date queries)
- `feedback_items.status` (for filtering)
- `feedback_items.type` (for filtering)
- `audit_logs.createdAt` (for time-series queries)

## Backup & Recovery

### Backup Strategy

- **Daily**: Automated Railway backups (7-day retention)
- **Weekly**: `pg_dump` to Cloudflare R2 (90-day retention)
- **Quarterly**: Restore testing

### Backup Command

```bash
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore Command

```bash
gunzip -c backup_20251114.sql.gz | psql $DATABASE_URL
```

---

**Last Updated**: 2025-11-14
**Schema Version**: 1.0.0
**Maintained By**: Engineering Team
