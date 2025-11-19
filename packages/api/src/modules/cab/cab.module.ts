import { Module } from '@nestjs/common';
import { CABService } from './cab.service';

@Module({
  providers: [CABService],
  exports: [CABService],
})
export class CABModule {}
