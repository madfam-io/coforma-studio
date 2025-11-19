import { Module } from '@nestjs/common';

import { TrpcRouter } from './trpc.router';
import { TrpcService } from './trpc.service';
import { CABModule } from '../modules/cab/cab.module';
import { CABMemberModule } from '../modules/cab-member/cab-member.module';

@Module({
  imports: [CABModule, CABMemberModule],
  providers: [TrpcService, TrpcRouter],
  exports: [TrpcService],
})
export class TrpcModule {}
