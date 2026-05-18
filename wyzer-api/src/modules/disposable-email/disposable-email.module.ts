import { Module } from '@nestjs/common';
import { DisposableEmailService } from './disposable-email.service';

@Module({
  providers: [DisposableEmailService],
  exports: [DisposableEmailService],
})
export class DisposableEmailModule {}
