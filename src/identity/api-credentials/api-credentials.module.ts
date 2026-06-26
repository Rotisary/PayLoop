import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ApiCredentialsService } from './api-credentials.service';
import { ApiCredentialsController } from './api-credentials.controller';
import { ApiKeyStrategy } from './strategies/api-key-auth.strategy';
import { ApiKeyAuthGuard } from './guards/api-credentials.guard';
import { AuthModule } from '../auth/auth.module';


@Module({
    imports: [PassportModule, AuthModule],
    providers: [ApiCredentialsService, ApiKeyStrategy, ApiKeyAuthGuard],
    controllers: [ApiCredentialsController],
    exports: [ApiKeyAuthGuard]
})
export class ApiCredentialsModule {}
