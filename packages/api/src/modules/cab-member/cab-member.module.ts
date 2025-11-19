import { Module } from '@nestjs/common';
import { CABMemberService } from './cab-member.service';

@Module({
  providers: [CABMemberService],
  exports: [CABMemberService],
})
export class CABMemberModule {}
