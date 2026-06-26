import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MerchantsModule } from './merchants/merchants.module';
import { ApiCredentialsModule } from './api-credentials/api-credentials.module';

@Module({
  imports: [AuthModule, MerchantsModule, ApiCredentialsModule],
})
export class IdentityModule {}
