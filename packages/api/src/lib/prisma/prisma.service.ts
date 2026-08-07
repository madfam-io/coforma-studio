import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { LoggerService } from '../logger/logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: LoggerService) {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected', 'PrismaService');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected', 'PrismaService');
  }

  /**
   * Set tenant context for Row-Level Security (RLS)
   * CRITICAL: This must be called before any tenant-scoped queries
   */
  async setTenantContext(tenantId: string): Promise<void> {
    // Postgres does not accept bind parameters in SET, so the obvious
    // `SET app.tenant_id = ${tenantId}` compiles to `SET app.tenant_id = $1`
    // and fails with 42601 (syntax error at or near "$1") on EVERY call —
    // i.e. RLS context was never actually established. set_config() is the
    // parameterizable equivalent; the value stays bound, so it is still
    // injection-safe. `false` keeps this session-scoped, matching the
    // original SET semantics.
    await this.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, false)`;
  }

  /**
   * Clear tenant context
   */
  async clearTenantContext(): Promise<void> {
    await this.$executeRaw`RESET app.tenant_id`;
  }
}
