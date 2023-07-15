import { Module } from '@nestjs/common';
import { MossService } from './moss.service';
import { MossController } from './moss.controller';

@Module({
  providers: [MossService],
  controllers: [MossController]
})
export class MossModule {}
