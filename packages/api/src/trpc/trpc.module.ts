import { Module } from '@nestjs/common';

import { TrpcRouter } from './trpc.router';
import { TrpcService } from './trpc.service';
import { CABModule } from '../modules/cab/cab.module';
import { CABMemberModule } from '../modules/cab-member/cab-member.module';
import { SessionModule } from '../modules/session/session.module';

@Module({
  imports: [CABModule, CABMemberModule, SessionModule],
  providers: [TrpcService, TrpcRouter],
  exports: [TrpcService],
})
export class TrpcModule {}
