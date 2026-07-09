import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '../../common/http/http.module';
import { MONO_CONFIG, createMonoConfig } from './mono.config';
import { MonoService } from './mono.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    MonoService,
    {
      provide: MONO_CONFIG,
      inject: [ConfigService],
      useFactory: createMonoConfig,
    },
  ],
  exports: [MonoService],
})
export class MonoModule {}
