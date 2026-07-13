import { Module } from '@nestjs/common';
import { ApiCredentialsModule } from '../../identity/api-credentials/api-credentials.module';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [ApiCredentialsModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}