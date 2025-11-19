import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('👋 Database disconnected');
  }

  /**
   * Set tenant context for Row-Level Security (RLS)
   * CRITICAL: Must be called before any tenant-scoped queries
   */
  async setTenantContext(tenantId: string) {
    await this.$executeRaw`SET app.tenant_id = ${tenantId}`;
  }

  /**
   * Clear tenant context (for cross-tenant admin operations)
   */
  async clearTenantContext() {
    await this.$executeRaw`RESET app.tenant_id`;
  }
}
