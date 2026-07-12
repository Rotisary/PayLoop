import { Module } from '@nestjs/common';
import { MonoModule } from '../../providers/mono/mono.module';
import { MandatesService } from './mandates.service';

@Module({
  imports: [MonoModule],
  providers: [
    MandatesService,
  ],
  exports: [MandatesService]
})
export class MandatesModule {}
