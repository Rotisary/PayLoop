import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from './common/http/http.module';
import { IdentityModule } from './identity/identity.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './common/queue';
import { MonoModule } from './providers/mono/mono.module';
import { CommerceModule } from './commerce/commerce.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule,
    HttpModule,
    QueueModule,
    MonoModule,
    IdentityModule,
    CommerceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
