import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ApiCredentialsService } from './api-credentials.service';
import { ApiCredentialsController } from './api-credentials.controller';
import { ApiKeyStrategy } from './strategies/api-key-auth.strategy';
import { ApiKeyAuthGuard } from './guards/api-credentials.guard';


@Module({
    imports: [PassportModule],
    providers: [ApiCredentialsService, ApiKeyStrategy],
    controllers: [ApiCredentialsController],
    exports: [ApiKeyAuthGuard]
})
export class ApiCredentialsModule {}
