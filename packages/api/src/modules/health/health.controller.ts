import { Controller, Get } from '@nestjs/common';

import { PrismaService } from '../../lib/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const timestamp = new Date().toISOString();

    // Check database connection
    let databaseStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      databaseStatus = 'error';
      console.error('Database health check failed:', error);
    }

    return {
      status: databaseStatus === 'ok' ? 'ok' : 'error',
      timestamp,
      services: {
        database: databaseStatus,
        // Redis and Meilisearch health checks will be added when implemented
      },
    };
  }
}
