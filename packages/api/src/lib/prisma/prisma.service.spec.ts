import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaService } from './prisma.service';

describe('PrismaService RLS Methods', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    prismaService = new PrismaService();
    await prismaService.$connect();
    // Clear any existing context
    await prismaService.clearTenantContext();
  });

  describe('setTenantContext', () => {
    it('should set the tenant context using parameterized query', async () => {
      const tenantId = '123e4567-e89b-12d3-a456-426614174000';

      await prismaService.setTenantContext(tenantId);

      // Verify context was set by reading it back
      const result = await prismaService.$queryRaw<
        Array<{ current_setting: string }>
      >`
        SELECT current_setting('app.tenant_id', true) as current_setting
      `;

      expect(result[0].current_setting).toBe(tenantId);
    });

    it('should handle different tenant IDs', async () => {
      const tenantId1 = '111e4567-e89b-12d3-a456-426614174001';
      const tenantId2 = '222e4567-e89b-12d3-a456-426614174002';

      // Set first tenant
      await prismaService.setTenantContext(tenantId1);
      let result = await prismaService.$queryRaw<
        Array<{ current_setting: string }>
      >`
        SELECT current_setting('app.tenant_id', true) as current_setting
      `;
      expect(result[0].current_setting).toBe(tenantId1);

      // Switch to second tenant
      await prismaService.setTenantContext(tenantId2);
      result = await prismaService.$queryRaw<
        Array<{ current_setting: string }>
      >`
        SELECT current_setting('app.tenant_id', true) as current_setting
      `;
      expect(result[0].current_setting).toBe(tenantId2);
    });

    it('should use parameterized queries to prevent SQL injection', async () => {
      // Try to inject SQL through tenant ID
      const maliciousTenantId = "'; DROP TABLE tenants; --";

      // This should safely set the value without executing the injection
      await expect(
        prismaService.setTenantContext(maliciousTenantId)
      ).resolves.not.toThrow();

      // Verify the value was set as a string (not executed as SQL)
      const result = await prismaService.$queryRaw<
        Array<{ current_setting: string }>
      >`
        SELECT current_setting('app.tenant_id', true) as current_setting
      `;

      // The malicious string should be stored as-is (proving it's parameterized)
      expect(result[0].current_setting).toBe(maliciousTenantId);
    });
  });

  describe('clearTenantContext', () => {
    it('should clear the tenant context', async () => {
      const tenantId = '123e4567-e89b-12d3-a456-426614174000';

      // Set context first
      await prismaService.setTenantContext(tenantId);

      // Verify it's set
      let result = await prismaService.$queryRaw<
        Array<{ current_setting: string }>
      >`
        SELECT current_setting('app.tenant_id', true) as current_setting
      `;
      expect(result[0].current_setting).toBe(tenantId);

      // Clear it
      await prismaService.clearTenantContext();

      // Verify it's cleared (should return empty string)
      result = await prismaService.$queryRaw<
        Array<{ current_setting: string }>
      >`
        SELECT current_setting('app.tenant_id', true) as current_setting
      `;
      expect(result[0].current_setting).toBe('');
    });

    it('should allow clearing context multiple times', async () => {
      await prismaService.clearTenantContext();
      await expect(prismaService.clearTenantContext()).resolves.not.toThrow();
    });
  });

  describe('Database connection lifecycle', () => {
    it('should connect to database on module init', async () => {
      const service = new PrismaService();
      await service.onModuleInit();

      // Verify connection by running a simple query
      const result = await service.$queryRaw<Array<{ now: Date }>>`
        SELECT NOW() as now
      `;

      expect(result[0].now).toBeInstanceOf(Date);

      await service.$disconnect();
    });

    it('should disconnect from database on module destroy', async () => {
      const service = new PrismaService();
      await service.onModuleInit();

      // Disconnect
      await service.onModuleDestroy();

      // Attempting to query after disconnect should fail
      await expect(
        service.$queryRaw`SELECT NOW()`
      ).rejects.toThrow();
    });
  });
});
