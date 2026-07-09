import { ConfigService } from '@nestjs/config';

export interface MonoConfig {
  baseUrl: string;
  secretKey: string;
}

export const MONO_CONFIG = Symbol('MONO_CONFIG');

export function createMonoConfig(configService: ConfigService): MonoConfig {
  return {
    baseUrl: configService.get<string>('MONO_BASE_URL')?.trim() ?? '',
    secretKey: configService.get<string>('MONO_SECRET_KEY')?.trim() ?? '',
  };
}
