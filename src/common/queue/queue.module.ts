import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUES } from './queue.constants';
import { QueueService } from './queue.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.getOrThrow<string>('REDIS_HOST');
        const redisPort = Number(configService.getOrThrow<string>('REDIS_PORT'));
        const redisPassword = configService.get<string>('REDIS_PASSWORD')?.trim();

        if (Number.isNaN(redisPort)) {
          throw new Error('REDIS_PORT must be a valid number');
        }

        return {
          connection: {
            host: redisHost,
            port: redisPort,
            ...(redisPassword ? { password: redisPassword } : {}),
          },
        };
      },
    }),
    BullModule.registerQueue(
      { name: QUEUES.OPT_IN },
      { name: QUEUES.BILLING },
      { name: QUEUES.WEBHOOK },
      { name: QUEUES.NOTIFICATION },
    ),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
