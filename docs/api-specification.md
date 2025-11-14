# API Specification

**Coforma Studio API Documentation**

## Overview

Coforma Studio exposes two types of APIs:

1. **tRPC API** - Type-safe internal API for frontend-backend communication
2. **REST API** - External webhooks and public endpoints

## Base URLs

| Environment | tRPC URL | REST URL |
|-------------|----------|----------|
| **Development** | `http://localhost:4000/trpc` | `http://localhost:4000/api` |
| **Staging** | `https://api-stage.coforma.studio/trpc` | `https://api-stage.coforma.studio/api` |
| **Production** | `https://api.coforma.studio/trpc` | `https://api.coforma.studio/api` |

## Authentication

All API requests require authentication via **session cookies** (NextAuth.js).

### Session Cookie

- **Name**: `next-auth.session-token`
- **Type**: HttpOnly, Secure, SameSite=Lax
- **Expiration**: 30 days

### Tenant Context

For multi-tenant isolation, all API requests must include the tenant context:

- **Header**: `X-Tenant-ID: <tenant-id>`
- **Alternative**: Inferred from subdomain (`tenant-slug.coforma.studio`)

## tRPC API

### Overview

tRPC provides end-to-end type safety between frontend and backend. All types are inferred automatically.

### Example Usage (Frontend)

```typescript
import { trpc } from '@/lib/trpc';

// Create a CAB
const { data: cab } = await trpc.cabs.create.mutate({
  name: 'Customer Advisory Board',
  slug: 'customer-advisory-board',
  description: 'Our main CAB for product feedback',
});

// List sessions
const { data: sessions } = await trpc.sessions.list.useQuery({
  cabId: cab.id,
  status: 'SCHEDULED',
});
```

### Router Structure

```
trpc/
├── auth                   # Authentication endpoints
├── tenants                # Tenant management
├── users                  # User management
├── cabs                   # CAB CRUD operations
├── sessions               # Session management
├── feedback               # Feedback items
├── actionItems            # Action items
├── integrations           # Third-party integrations
├── analytics              # Analytics & reporting
└── admin                  # Admin-only endpoints
```

### Endpoints by Router

#### `auth`

- `auth.session` - Get current session
- `auth.signOut` - Sign out user

#### `tenants`

- `tenants.create` - Create tenant (admin only)
- `tenants.get` - Get tenant details
- `tenants.update` - Update tenant settings
- `tenants.delete` - Delete tenant (admin only)

#### `cabs`

- `cabs.list` - List CABs for tenant
- `cabs.get` - Get CAB by ID
- `cabs.create` - Create CAB
- `cabs.update` - Update CAB
- `cabs.delete` - Delete CAB
- `cabs.addMember` - Add member to CAB
- `cabs.removeMember` - Remove member from CAB
- `cabs.listMembers` - List CAB members

#### `sessions`

- `sessions.list` - List sessions
- `sessions.get` - Get session details
- `sessions.create` - Schedule session
- `sessions.update` - Update session
- `sessions.cancel` - Cancel session
- `sessions.recordAttendance` - Record attendance
- `sessions.addMinutes` - Add meeting minutes

#### `feedback`

- `feedback.list` - List feedback items
- `feedback.get` - Get feedback item
- `feedback.create` - Submit feedback
- `feedback.update` - Update feedback
- `feedback.delete` - Delete feedback
- `feedback.vote` - Vote on feedback
- `feedback.comment` - Add comment

#### `actionItems`

- `actionItems.list` - List action items
- `actionItems.get` - Get action item
- `actionItems.create` - Create action item
- `actionItems.update` - Update action item
- `actionItems.complete` - Mark as complete

#### `integrations`

- `integrations.list` - List connected integrations
- `integrations.connect` - Connect integration (OAuth)
- `integrations.disconnect` - Disconnect integration
- `integrations.sync` - Trigger manual sync

#### `analytics`

- `analytics.engagement` - Get engagement metrics
- `analytics.programHealth` - Get program health metrics
- `analytics.businessImpact` - Get business impact metrics
- `analytics.exportReport` - Export report (PDF/CSV)

## REST API

### Webhooks

#### Stripe Webhooks

**Endpoint**: `POST /api/webhooks/stripe`

Events handled:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Request**:
```json
{
  "id": "evt_...",
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_...",
      "customer": "cus_...",
      "status": "active"
    }
  }
}
```

**Verification**: Stripe signature verification required

#### Zoom Webhooks

**Endpoint**: `POST /api/webhooks/zoom`

Events handled:
- `meeting.ended`
- `recording.completed`
- `participant.joined`
- `participant.left`

**Request**:
```json
{
  "event": "meeting.ended",
  "payload": {
    "object": {
      "id": "1234567890",
      "uuid": "abcd1234",
      "host_id": "xyz789",
      "duration": 60
    }
  }
}
```

**Verification**: Zoom webhook secret verification required

#### Slack Webhooks

**Endpoint**: `POST /api/webhooks/slack`

Events handled:
- `url_verification` (initial verification)
- `message.channels` (new messages in connected channels)

#### Jira Webhooks

**Endpoint**: `POST /api/webhooks/jira`

Events handled:
- `jira:issue_created`
- `jira:issue_updated`
- `jira:issue_deleted`

#### Asana Webhooks

**Endpoint**: `POST /api/webhooks/asana`

Events handled:
- `task.created`
- `task.updated`
- `task.deleted`

#### ClickUp Webhooks

**Endpoint**: `POST /api/webhooks/clickup`

Events handled:
- `taskCreated`
- `taskUpdated`
- `taskDeleted`

### Public Endpoints

#### Health Check

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-14T10:30:00Z",
  "services": {
    "database": "ok",
    "redis": "ok",
    "meilisearch": "ok"
  }
}
```

#### Invite Acceptance

**Endpoint**: `GET /api/invites/:token`

**Response**:
```json
{
  "email": "user@example.com",
  "tenant": {
    "id": "...",
    "name": "Acme Corp"
  },
  "cabId": "...",
  "expiresAt": "2025-12-01T00:00:00Z"
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in to perform this action",
    "path": "cabs.create",
    "timestamp": "2025-11-14T10:30:00Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `BAD_REQUEST` | 400 | Invalid input |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

## Rate Limiting

### Limits by Endpoint Type

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| **Authentication** | 5 requests | 15 minutes |
| **Public API** | 100 requests | 15 minutes |
| **Authenticated API** | 1000 requests | 15 minutes |
| **Webhooks** | No limit | - |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1636976400
```

## Pagination

List endpoints support cursor-based pagination:

**Request**:
```typescript
{
  cursor: "eyJpZCI6IjEyMyJ9", // Optional cursor from previous response
  limit: 50 // Max 100
}
```

**Response**:
```typescript
{
  items: [...],
  nextCursor: "eyJpZCI6IjE3MyJ9", // null if no more items
  hasMore: true
}
```

## Filtering & Sorting

### Filters

```typescript
{
  filters: {
    status: { in: ["OPEN", "UNDER_REVIEW"] },
    createdAt: { gte: "2025-01-01T00:00:00Z" },
    tags: { contains: "urgent" }
  }
}
```

### Sorting

```typescript
{
  orderBy: {
    createdAt: "desc"
  }
}
```

## OpenAPI Schema

Full OpenAPI 3.0 schema available at:

- **Staging**: `https://api-stage.coforma.studio/openapi.json`
- **Production**: `https://api.coforma.studio/openapi.json`

## SDKs

### Official SDKs

- **TypeScript/JavaScript**: Built-in via tRPC
- **Python**: Planned (Phase 2)
- **Go**: Planned (Phase 2)

### Example: TypeScript Client

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@coforma/api';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://api.coforma.studio/trpc',
      headers() {
        return {
          'X-Tenant-ID': 'tenant-id',
        };
      },
    }),
  ],
});

// Use the client
const cabs = await client.cabs.list.query();
```

## Versioning

- **Current Version**: v1 (no version in URL)
- **Breaking Changes**: Will introduce v2 with `/v2/` prefix
- **Deprecation Policy**: 6 months notice for breaking changes

## Changelog

### v1.0.0 (Planned - Q1 2026)

- Initial API release
- tRPC + REST endpoints
- Webhooks for Stripe, Zoom, Slack, Jira, Asana, ClickUp

---

**Last Updated**: 2025-11-14
**Maintained By**: Engineering Team
