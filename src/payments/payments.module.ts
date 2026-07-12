import { Module } from '@nestjs/common';
import { MandatesModule } from './mandates/mandates.module';

@Module({
    imports: [MandatesModule],
})
export class PaymentsModule {}
