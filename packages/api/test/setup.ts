import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Ensure test database is set up
  const testDbUrl = process.env.DATABASE_URL;

  if (!testDbUrl || !testDbUrl.includes('test')) {
    throw new Error(
      'DATABASE_URL must include "test" to run tests. ' +
      'Set DATABASE_URL to a test database connection string.'
    );
  }

  // Run migrations on test database
  try {
    execSync('pnpm prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: testDbUrl },
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Failed to run migrations:', error);
    throw error;
  }

  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Clean up between tests
afterEach(async () => {
  // Clear tenant context
  await prisma.$executeRaw`RESET app.tenant_id`;

  // Clean up all data in reverse dependency order
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.sessionMinute.deleteMany();
  await prisma.sessionAttendee.deleteMany();
  await prisma.feedbackItem.deleteMany();
  await prisma.session.deleteMany();
  await prisma.cABMembership.deleteMany();
  await prisma.cAB.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.caseStudy.deleteMany();
  await prisma.discountPlan.deleteMany();
  await prisma.integration.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.tenantMembership.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.account.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();
});

// Export prisma instance for tests
export { prisma };
