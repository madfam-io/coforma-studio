import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
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
   * CRITICAL: This must be called before any tenant-scoped queries
   */
  async setTenantContext(tenantId: string): Promise<void> {
    await this.$executeRaw`SET app.tenant_id = ${tenantId}`;
  }

  /**
   * Clear tenant context
   */
  async clearTenantContext(): Promise<void> {
    await this.$executeRaw`RESET app.tenant_id`;
  }
}
