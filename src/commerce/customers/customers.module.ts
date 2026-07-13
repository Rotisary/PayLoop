import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { MonoModule } from '../../providers/mono/mono.module';

@Module({
  imports: [MonoModule],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}