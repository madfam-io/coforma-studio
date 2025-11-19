import { PrismaClient, Tenant, User, TenantMembership } from '@prisma/client';

export interface TestTenant {
  tenant: Tenant;
  admin: User;
  membership: TenantMembership;
}

/**
 * Create a test tenant with an admin user
 */
export async function createTestTenant(
  prisma: PrismaClient,
  data?: {
    tenantSlug?: string;
    tenantName?: string;
    userEmail?: string;
    userName?: string;
  }
): Promise<TestTenant> {
  const tenantSlug = data?.tenantSlug || `test-tenant-${Date.now()}`;
  const tenantName = data?.tenantName || 'Test Tenant';
  const userEmail = data?.userEmail || `admin-${Date.now()}@test.com`;
  const userName = data?.userName || 'Test Admin';

  // Clear any RLS context first (we need to create tenants without RLS)
  await prisma.$executeRaw`RESET app.tenant_id`;

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      slug: tenantSlug,
      name: tenantName,
    },
  });

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: userEmail,
      name: userName,
    },
  });

  // Create tenant membership
  const membership = await prisma.tenantMembership.create({
    data: {
      tenantId: tenant.id,
      userId: admin.id,
      role: 'ADMIN',
    },
  });

  return { tenant, admin, membership };
}

/**
 * Create a regular user and add them to a tenant
 */
export async function createTenantMember(
  prisma: PrismaClient,
  tenantId: string,
  data?: {
    email?: string;
    name?: string;
    role?: 'ADMIN' | 'FACILITATOR' | 'MEMBER';
  }
): Promise<{ user: User; membership: TenantMembership }> {
  const email = data?.email || `member-${Date.now()}@test.com`;
  const name = data?.name || 'Test Member';
  const role = data?.role || 'MEMBER';

  await prisma.$executeRaw`RESET app.tenant_id`;

  const user = await prisma.user.create({
    data: { email, name },
  });

  const membership = await prisma.tenantMembership.create({
    data: {
      tenantId,
      userId: user.id,
      role,
    },
  });

  return { user, membership };
}

/**
 * Set the RLS tenant context for a given tenant
 */
export async function setTenantContext(
  prisma: PrismaClient,
  tenantId: string
): Promise<void> {
  await prisma.$executeRaw`SET app.tenant_id = ${tenantId}`;
}

/**
 * Clear the RLS tenant context
 */
export async function clearTenantContext(
  prisma: PrismaClient
): Promise<void> {
  await prisma.$executeRaw`RESET app.tenant_id`;
}

/**
 * Get the current tenant context
 */
export async function getCurrentTenantContext(
  prisma: PrismaClient
): Promise<string | null> {
  const result = await prisma.$queryRaw<Array<{ current_setting: string }>>`
    SELECT current_setting('app.tenant_id', true) as current_setting
  `;

  const value = result[0]?.current_setting;
  return value && value !== '' ? value : null;
}
