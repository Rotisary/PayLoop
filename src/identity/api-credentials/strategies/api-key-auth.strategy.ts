import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { AuthenticationContext } from '../../../common/types/auth/authentication-context.type';
import { ApiCredentialsService } from '../api-credentials.service';


@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
    constructor(
        private readonly apiKeysService: ApiCredentialsService,
    ) {
        super();
    }

    private extractKey(request: Request): string | null {
        const authHeader = request.headers['authorization'];
        if (!authHeader) return null;

        const [scheme, token] = authHeader.split(' ');
        if (scheme?.toLowerCase() !== 'bearer' || !token) return null;

        if (!token.startsWith('pl_live_') && !token.startsWith('pl_test_')) {
        return null;
        }

        return token;
    }

    async validate(request: Request): Promise<AuthenticationContext> {
        const rawKey = this.extractKey(request);

        if (!rawKey) {
            throw new UnauthorizedException(
                'Missing API key. Provide a valid key in the Authorization header.'
            );
        }

        return this.apiKeysService.validateApiKey(rawKey);
    }
}