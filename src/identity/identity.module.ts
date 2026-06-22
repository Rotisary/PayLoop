import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MerchantsModule } from './merchants/merchants.module';

@Module({
  imports: [AuthModule, MerchantsModule],
})
export class IdentityModule {}
