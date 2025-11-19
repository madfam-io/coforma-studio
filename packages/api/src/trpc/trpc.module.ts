import { Module } from '@nestjs/common';

import { TrpcRouter } from './trpc.router';
import { TrpcService } from './trpc.service';
import { CABModule } from '../modules/cab/cab.module';

@Module({
  imports: [CABModule],
  providers: [TrpcService, TrpcRouter],
  exports: [TrpcService],
})
export class TrpcModule {}
