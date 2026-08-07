import { beforeAll, afterAll, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

/**
 * Two connections, on purpose.
 *
 * Postgres ALWAYS bypasses row-level security for superusers and for a table's
 * owner (unless FORCE ROW LEVEL SECURITY is set). CI's service container hands
 * us `postgres`, which is both — so every RLS policy in the schema is inert on
 * that connection and an "isolation" assertion made through it proves nothing.
 *
 * So:
 *   - `adminPrisma` keeps the DATABASE_URL role (superuser). It runs
 *     migrations, provisions the app role, and truncates between tests. It is
 *     the right client for SEEDING rows that RLS would otherwise forbid.
 *   - `prisma` connects as an unprivileged, NOBYPASSRLS role. It is the client
 *     under test: every policy actually applies to it, so assertions made
 *     through it are meaningful.
 *
 * `.env.example` already points the app at a non-superuser role (`coforma`),
 * so this mirrors the intended production posture rather than inventing one.
 */
const TEST_APP_ROLE = 'coforma_rls_test';
// Placeholder credential for a throwaway local/CI test database only.
const TEST_APP_PASSWORD = 'coforma_rls_test_pw';

function appRoleUrl(adminUrl: string): string {
  const url = new URL(adminUrl);
  url.username = TEST_APP_ROLE;
  url.password = TEST_APP_PASSWORD;
  // RLS context is set with set_config(..., false), which is SESSION scoped.
  // With a multi-connection pool the next query can land on a different backend
  // that never saw the setting, making isolation tests nondeterministic. One
  // connection keeps the session — and therefore the tenant context — stable.
  url.searchParams.set('connection_limit', '1');
  return url.toString();
}

const adminPrisma = new PrismaClient();
let prisma: PrismaClient;

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

  await adminPrisma.$connect();

  // Provision the unprivileged role the RLS assertions run as. NOBYPASSRLS is
  // the point: without it the policies are decorative.
  // Vitest runs test files in parallel and setupFiles run once per file, so
  // several workers race here. CREATE ROLE is not atomic with a preceding
  // existence check, so swallow the duplicate instead of testing for it.
  await adminPrisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      CREATE ROLE ${TEST_APP_ROLE} LOGIN PASSWORD '${TEST_APP_PASSWORD}';
    EXCEPTION
      WHEN duplicate_object OR unique_violation THEN NULL;
    END
    $$;
  `);
  await adminPrisma.$executeRawUnsafe(
    `ALTER ROLE ${TEST_APP_ROLE} NOSUPERUSER NOBYPASSRLS`
  );
  await adminPrisma.$executeRawUnsafe(
    `GRANT USAGE ON SCHEMA public TO ${TEST_APP_ROLE}`
  );
  await adminPrisma.$executeRawUnsafe(
    `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${TEST_APP_ROLE}`
  );
  await adminPrisma.$executeRawUnsafe(
    `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${TEST_APP_ROLE}`
  );

  prisma = new PrismaClient({
    datasources: { db: { url: appRoleUrl(testDbUrl) } },
  });
  await prisma.$connect();
});

afterAll(async () => {
  await prisma?.$disconnect();
  await adminPrisma.$disconnect();
});

// Clean up between tests. Runs on the admin connection: the app role only sees
// rows its tenant context allows, so cleaning through it would silently leave
// data behind and leak state into the next test.
afterEach(async () => {
  // Clear tenant context on the client under test
  if (prisma) {
    await prisma.$executeRaw`RESET app.tenant_id`;
  }

  // Clean up all data in reverse dependency order
  await adminPrisma.vote.deleteMany();
  await adminPrisma.comment.deleteMany();
  await adminPrisma.sessionMinute.deleteMany();
  await adminPrisma.sessionAttendee.deleteMany();
  await adminPrisma.feedbackItem.deleteMany();
  await adminPrisma.session.deleteMany();
  await adminPrisma.partnershipAgreement.deleteMany();
  await adminPrisma.cABMembership.deleteMany();
  await adminPrisma.cAB.deleteMany();
  await adminPrisma.actionItem.deleteMany();
  await adminPrisma.userBadge.deleteMany();
  await adminPrisma.badge.deleteMany();
  await adminPrisma.referral.deleteMany();
  await adminPrisma.caseStudy.deleteMany();
  await adminPrisma.discountPlan.deleteMany();
  await adminPrisma.integration.deleteMany();
  await adminPrisma.invite.deleteMany();
  await adminPrisma.auditLog.deleteMany();
  await adminPrisma.tenantMembership.deleteMany();
  await adminPrisma.tenant.deleteMany();
  await adminPrisma.account.deleteMany();
  await adminPrisma.userSession.deleteMany();
  await adminPrisma.user.deleteMany();
});

// `prisma` is the RLS-subject client (assert through it).
// `adminPrisma` bypasses RLS (seed through it).
export { prisma, adminPrisma };
