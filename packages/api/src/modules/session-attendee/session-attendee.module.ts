import { Module } from '@nestjs/common';
import { SessionAttendeeService } from './session-attendee.service';

@Module({
  providers: [SessionAttendeeService],
  exports: [SessionAttendeeService],
})
export class SessionAttendeeModule {}
