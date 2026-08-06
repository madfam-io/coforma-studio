import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

// Core modules
import { PhyndCrmModule } from './integrations/phyndcrm/phyndcrm.module';
import { GlobalExceptionFilter } from './lib/errors/global-exception.filter';
import { LoggerModule } from './lib/logger/logger.module';
import { LoggerService } from './lib/logger/logger.service';
import { PrismaModule } from './lib/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { TrpcModule } from './trpc/trpc.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
        limit: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      },
    ]),

    // Core modules
    LoggerModule,
    PrismaModule,
    TrpcModule,
    HealthModule,

    // Ecosystem integrations
    PhyndCrmModule,

    // Feature modules will be added here as they are implemented
    // TenantModule,
    // UserModule,
    // CABModule,
    // etc.
  ],
  providers: [
    {
      provide: APP_FILTER,
      useFactory: (logger: LoggerService) => new GlobalExceptionFilter(logger),
      inject: [LoggerService],
    },
  ],
})
export class AppModule {}
