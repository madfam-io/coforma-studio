import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../setup';
import {
  createTestTenant,
  setTenantContext,
  clearTenantContext,
  getCurrentTenantContext,
} from '../utils/test-helpers';

describe('Row-Level Security (RLS) - Tenant Isolation', () => {
  describe('RLS Context Management', () => {
    it('should set and retrieve tenant context', async () => {
      const { tenant } = await createTestTenant(prisma, {
        tenantSlug: 'context-test',
      });

      await setTenantContext(prisma, tenant.id);
      const context = await getCurrentTenantContext(prisma);

      expect(context).toBe(tenant.id);
    });

    it('should clear tenant context', async () => {
      const { tenant } = await createTestTenant(prisma, {
        tenantSlug: 'clear-test',
      });

      await setTenantContext(prisma, tenant.id);
      await clearTenantContext(prisma);
      const context = await getCurrentTenantContext(prisma);

      expect(context).toBeNull();
    });
  });

  describe('Tenant Table Isolation', () => {
    it('should only return tenants matching the RLS context', async () => {
      // Create two separate tenants
      const { tenant: tenant1 } = await createTestTenant(prisma, {
        tenantSlug: 'tenant-1',
        tenantName: 'Tenant One',
      });

      const { tenant: tenant2 } = await createTestTenant(prisma, {
        tenantSlug: 'tenant-2',
        tenantName: 'Tenant Two',
      });

      // Set context to tenant1
      await setTenantContext(prisma, tenant1.id);

      // Query should only return tenant1
      const tenants = await prisma.tenant.findMany();
      expect(tenants).toHaveLength(1);
      expect(tenants[0].id).toBe(tenant1.id);
      expect(tenants[0].slug).toBe('tenant-1');

      // Switch context to tenant2
      await setTenantContext(prisma, tenant2.id);

      // Now should only return tenant2
      const tenants2 = await prisma.tenant.findMany();
      expect(tenants2).toHaveLength(1);
      expect(tenants2[0].id).toBe(tenant2.id);
      expect(tenants2[0].slug).toBe('tenant-2');
    });

    it('should not return any tenants without context set', async () => {
      await createTestTenant(prisma, { tenantSlug: 'no-context-test' });

      // Clear context
      await clearTenantContext(prisma);

      // Should return empty array due to RLS
      const tenants = await prisma.tenant.findMany();
      expect(tenants).toHaveLength(0);
    });
  });

  describe('CAB Isolation', () => {
    it('should prevent tenant A from accessing tenant B CABs', async () => {
      // Create two tenants
      const { tenant: tenantA } = await createTestTenant(prisma, {
        tenantSlug: 'tenant-a',
      });

      const { tenant: tenantB } = await createTestTenant(prisma, {
        tenantSlug: 'tenant-b',
      });

      // Clear context and create CABs
      await clearTenantContext(prisma);

      const cabA = await prisma.cAB.create({
        data: {
          tenantId: tenantA.id,
          name: 'CAB A',
          slug: 'cab-a',
        },
      });

      const cabB = await prisma.cAB.create({
        data: {
          tenantId: tenantB.id,
          name: 'CAB B',
          slug: 'cab-b',
        },
      });

      // Set context to tenant A
      await setTenantContext(prisma, tenantA.id);

      // Should only see CAB A
      const cabsA = await prisma.cAB.findMany();
      expect(cabsA).toHaveLength(1);
      expect(cabsA[0].id).toBe(cabA.id);
      expect(cabsA[0].name).toBe('CAB A');

      // Set context to tenant B
      await setTenantContext(prisma, tenantB.id);

      // Should only see CAB B
      const cabsB = await prisma.cAB.findMany();
      expect(cabsB).toHaveLength(1);
      expect(cabsB[0].id).toBe(cabB.id);
      expect(cabsB[0].name).toBe('CAB B');
    });

    it('should prevent querying CAB by ID from another tenant', async () => {
      const { tenant: tenantA } = await createTestTenant(prisma, {
        tenantSlug: 'tenant-a-query',
      });

      const { tenant: tenantB } = await createTestTenant(prisma, {
        tenantSlug: 'tenant-b-query',
      });

      await clearTenantContext(prisma);

      const cabA = await prisma.cAB.create({
        data: {
          tenantId: tenantA.id,
          name: 'CAB A',
          slug: 'cab-a-query',
        },
      });

      // Set context to tenant B
      await setTenantContext(prisma, tenantB.id);

      // Try to query CAB A (which belongs to tenant A)
      const result = await prisma.cAB.findUnique({
        where: { id: cabA.id },
      });

      // Should return null due to RLS
      expect(result).toBeNull();
    });
  });

  describe('Session Isolation', () => {
    it('should isolate sessions by tenant', async () => {
      const { tenant: tenantA } = await createTestTenant(prisma, {
        tenantSlug: 'session-tenant-a',
      });

      const { tenant: tenantB } = await createTestTenant(prisma, {
        tenantSlug: 'session-tenant-b',
      });

      await clearTenantContext(prisma);

      // Create CABs for each tenant
      const cabA = await prisma.cAB.create({
        data: {
          tenantId: tenantA.id,
          name: 'CAB A',
          slug: 'cab-session-a',
        },
      });

      const cabB = await prisma.cAB.create({
        data: {
          tenantId: tenantB.id,
          name: 'CAB B',
          slug: 'cab-session-b',
        },
      });

      // Create sessions
      const sessionA = await prisma.session.create({
        data: {
          tenantId: tenantA.id,
          cabId: cabA.id,
          title: 'Session A',
          scheduledAt: new Date(),
        },
      });

      const sessionB = await prisma.session.create({
        data: {
          tenantId: tenantB.id,
          cabId: cabB.id,
          title: 'Session B',
          scheduledAt: new Date(),
        },
      });

      // Set context to tenant A
      await setTenantContext(prisma, tenantA.id);

      const sessionsA = await prisma.session.findMany();
      expect(sessionsA).toHaveLength(1);
      expect(sessionsA[0].id).toBe(sessionA.id);
      expect(sessionsA[0].title).toBe('Session A');

      // Set context to tenant B
      await setTenantContext(prisma, tenantB.id);

      const sessionsB = await prisma.session.findMany();
      expect(sessionsB).toHaveLength(1);
      expect(sessionsB[0].id).toBe(sessionB.id);
      expect(sessionsB[0].title).toBe('Session B');
    });
  });

  describe('Feedback Isolation', () => {
    it('should prevent cross-tenant feedback access', async () => {
      const { tenant: tenantA, admin: userA } = await createTestTenant(
        prisma,
        {
          tenantSlug: 'feedback-tenant-a',
        }
      );

      const { tenant: tenantB, admin: userB } = await createTestTenant(
        prisma,
        {
          tenantSlug: 'feedback-tenant-b',
        }
      );

      await clearTenantContext(prisma);

      // Create feedback items
      const feedbackA = await prisma.feedbackItem.create({
        data: {
          tenantId: tenantA.id,
          userId: userA.id,
          title: 'Feedback A',
          description: 'Description A',
          type: 'IDEA',
        },
      });

      const feedbackB = await prisma.feedbackItem.create({
        data: {
          tenantId: tenantB.id,
          userId: userB.id,
          title: 'Feedback B',
          description: 'Description B',
          type: 'BUG',
        },
      });

      // Set context to tenant A
      await setTenantContext(prisma, tenantA.id);

      const feedbacksA = await prisma.feedbackItem.findMany();
      expect(feedbacksA).toHaveLength(1);
      expect(feedbacksA[0].id).toBe(feedbackA.id);
      expect(feedbacksA[0].title).toBe('Feedback A');

      // Try to access feedback B by ID
      const feedbackBFromA = await prisma.feedbackItem.findUnique({
        where: { id: feedbackB.id },
      });
      expect(feedbackBFromA).toBeNull();
    });
  });

  describe('Action Items Isolation', () => {
    it('should isolate action items by tenant', async () => {
      const { tenant: tenantA } = await createTestTenant(prisma, {
        tenantSlug: 'action-tenant-a',
      });

      const { tenant: tenantB } = await createTestTenant(prisma, {
        tenantSlug: 'action-tenant-b',
      });

      await clearTenantContext(prisma);

      const actionA = await prisma.actionItem.create({
        data: {
          tenantId: tenantA.id,
          title: 'Action A',
        },
      });

      const actionB = await prisma.actionItem.create({
        data: {
          tenantId: tenantB.id,
          title: 'Action B',
        },
      });

      // Set context to tenant A
      await setTenantContext(prisma, tenantA.id);

      const actionsA = await prisma.actionItem.findMany();
      expect(actionsA).toHaveLength(1);
      expect(actionsA[0].id).toBe(actionA.id);

      // Set context to tenant B
      await setTenantContext(prisma, tenantB.id);

      const actionsB = await prisma.actionItem.findMany();
      expect(actionsB).toHaveLength(1);
      expect(actionsB[0].id).toBe(actionB.id);
    });
  });

  describe('Complex Relationships - Comments and Votes', () => {
    it('should prevent access to comments on feedback from another tenant', async () => {
      const { tenant: tenantA, admin: userA } = await createTestTenant(
        prisma,
        {
          tenantSlug: 'comment-tenant-a',
        }
      );

      const { tenant: tenantB, admin: userB } = await createTestTenant(
        prisma,
        {
          tenantSlug: 'comment-tenant-b',
        }
      );

      await clearTenantContext(prisma);

      // Create feedback for each tenant
      const feedbackA = await prisma.feedbackItem.create({
        data: {
          tenantId: tenantA.id,
          userId: userA.id,
          title: 'Feedback A',
          description: 'Description A',
          type: 'IDEA',
        },
      });

      const feedbackB = await prisma.feedbackItem.create({
        data: {
          tenantId: tenantB.id,
          userId: userB.id,
          title: 'Feedback B',
          description: 'Description B',
          type: 'IDEA',
        },
      });

      // Create comments
      const commentA = await prisma.comment.create({
        data: {
          feedbackItemId: feedbackA.id,
          userId: userA.id,
          content: 'Comment on Feedback A',
        },
      });

      const commentB = await prisma.comment.create({
        data: {
          feedbackItemId: feedbackB.id,
          userId: userB.id,
          content: 'Comment on Feedback B',
        },
      });

      // Set context to tenant A
      await setTenantContext(prisma, tenantA.id);

      // Should only see comments on tenant A feedback
      const commentsA = await prisma.comment.findMany();
      expect(commentsA).toHaveLength(1);
      expect(commentsA[0].id).toBe(commentA.id);
      expect(commentsA[0].content).toBe('Comment on Feedback A');

      // Try to access comment B by ID
      const commentBFromA = await prisma.comment.findUnique({
        where: { id: commentB.id },
      });
      expect(commentBFromA).toBeNull();
    });

    it('should prevent access to votes on feedback from another tenant', async () => {
      const { tenant: tenantA, admin: userA } = await createTestTenant(
        prisma,
        {
          tenantSlug: 'vote-tenant-a',
        }
      );

      const { tenant: tenantB, admin: userB } = await createTestTenant(
        prisma,
        {
          tenantSlug: 'vote-tenant-b',
        }
      );

      await clearTenantContext(prisma);

      // Create feedback for each tenant
      const feedbackA = await prisma.feedbackItem.create({
        data: {
          tenantId: tenantA.id,
          userId: userA.id,
          title: 'Feedback A',
          description: 'Description A',
          type: 'IDEA',
        },
      });

      const feedbackB = await prisma.feedbackItem.create({
        data: {
          tenantId: tenantB.id,
          userId: userB.id,
          title: 'Feedback B',
          description: 'Description B',
          type: 'IDEA',
        },
      });

      // Create votes
      const voteA = await prisma.vote.create({
        data: {
          feedbackItemId: feedbackA.id,
          userId: userA.id,
          value: 1,
        },
      });

      const voteB = await prisma.vote.create({
        data: {
          feedbackItemId: feedbackB.id,
          userId: userB.id,
          value: 1,
        },
      });

      // Set context to tenant A
      await setTenantContext(prisma, tenantA.id);

      const votesA = await prisma.vote.findMany();
      expect(votesA).toHaveLength(1);
      expect(votesA[0].id).toBe(voteA.id);

      // Try to access vote B
      const voteBFromA = await prisma.vote.findUnique({
        where: { id: voteB.id },
      });
      expect(voteBFromA).toBeNull();
    });
  });

  describe('Write Operations with RLS', () => {
    it('should prevent creating CAB in wrong tenant context', async () => {
      const { tenant: tenantA } = await createTestTenant(prisma, {
        tenantSlug: 'write-tenant-a',
      });

      const { tenant: tenantB } = await createTestTenant(prisma, {
        tenantSlug: 'write-tenant-b',
      });

      // Set context to tenant A
      await setTenantContext(prisma, tenantA.id);

      // Try to create CAB for tenant B (should fail or be hidden)
      // Note: Prisma will still create it, but RLS will prevent reading it
      const cab = await prisma.cAB.create({
        data: {
          tenantId: tenantB.id, // Wrong tenant!
          name: 'CAB for B',
          slug: 'cab-for-b',
        },
      });

      // Query should not return the CAB we just created (RLS blocks it)
      const foundCab = await prisma.cAB.findUnique({
        where: { id: cab.id },
      });

      expect(foundCab).toBeNull();

      // Switch to tenant B context
      await setTenantContext(prisma, tenantB.id);

      // Now it should be visible
      const foundInB = await prisma.cAB.findUnique({
        where: { id: cab.id },
      });

      expect(foundInB).not.toBeNull();
      expect(foundInB?.name).toBe('CAB for B');
    });
  });

  describe('Badge and Discount Plan Isolation', () => {
    it('should isolate discount plans by tenant', async () => {
      const { tenant: tenantA } = await createTestTenant(prisma, {
        tenantSlug: 'discount-tenant-a',
      });

      const { tenant: tenantB } = await createTestTenant(prisma, {
        tenantSlug: 'discount-tenant-b',
      });

      await clearTenantContext(prisma);

      const discountA = await prisma.discountPlan.create({
        data: {
          tenantId: tenantA.id,
          name: 'Discount A',
          type: 'PERCENTAGE',
          value: 20,
        },
      });

      const discountB = await prisma.discountPlan.create({
        data: {
          tenantId: tenantB.id,
          name: 'Discount B',
          type: 'FIXED',
          value: 50,
        },
      });

      // Set context to tenant A
      await setTenantContext(prisma, tenantA.id);

      const discountsA = await prisma.discountPlan.findMany();
      expect(discountsA).toHaveLength(1);
      expect(discountsA[0].id).toBe(discountA.id);

      // Set context to tenant B
      await setTenantContext(prisma, tenantB.id);

      const discountsB = await prisma.discountPlan.findMany();
      expect(discountsB).toHaveLength(1);
      expect(discountsB[0].id).toBe(discountB.id);
    });

    it('should isolate badges by tenant', async () => {
      const { tenant: tenantA } = await createTestTenant(prisma, {
        tenantSlug: 'badge-tenant-a',
      });

      const { tenant: tenantB } = await createTestTenant(prisma, {
        tenantSlug: 'badge-tenant-b',
      });

      await clearTenantContext(prisma);

      const badgeA = await prisma.badge.create({
        data: {
          tenantId: tenantA.id,
          name: 'Badge A',
          type: 'FOUNDING_PARTNER',
        },
      });

      const badgeB = await prisma.badge.create({
        data: {
          tenantId: tenantB.id,
          name: 'Badge B',
          type: 'INFLUENCER',
        },
      });

      // Set context to tenant A
      await setTenantContext(prisma, tenantA.id);

      const badgesA = await prisma.badge.findMany();
      expect(badgesA).toHaveLength(1);
      expect(badgesA[0].id).toBe(badgeA.id);

      // Verify tenant B badge is not accessible
      const badgeBFromA = await prisma.badge.findUnique({
        where: { id: badgeB.id },
      });
      expect(badgeBFromA).toBeNull();
    });
  });
});
