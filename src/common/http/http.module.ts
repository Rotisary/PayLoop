import { HttpModule as NestHttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HTTP_DEFAULT_MAX_REDIRECTS, HTTP_DEFAULT_TIMEOUT_MS } from './http.constants';
import { HttpClient } from './http.service';


@Module({
  imports: [
    NestHttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const timeout = Number(configService.get<string>('HTTP_TIMEOUT')?.trim());
        const maxRedirects = Number(configService.get<string>('HTTP_MAX_REDIRECTS')?.trim());

        return {
          timeout: Number.isFinite(timeout) && timeout > 0
              ? timeout : HTTP_DEFAULT_TIMEOUT_MS,
          maxRedirects: Number.isFinite(maxRedirects) && maxRedirects >= 0
              ? maxRedirects : HTTP_DEFAULT_MAX_REDIRECTS,
        };
      },
    }),
  ],
  providers: [HttpClient],
  exports: [HttpClient],
})
export class HttpModule {}
