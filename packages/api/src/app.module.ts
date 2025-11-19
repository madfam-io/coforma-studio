import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Core modules
import { PrismaModule } from './lib/prisma/prisma.module';
import { TrpcModule } from './trpc/trpc.module';
import { HealthModule } from './modules/health/health.module';

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
    PrismaModule,
    TrpcModule,
    HealthModule,

    // Feature modules will be added here as they are implemented
    // TenantModule,
    // UserModule,
    // CABModule,
    // etc.
  ],
})
export class AppModule {}
