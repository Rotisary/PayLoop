import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApiCredentialDto } from './dto/create-api-credential.dto';
import { UpdateApiCredentialDto } from './dto/update-api-credential.dto';
import {
  ApiCredentialCreatedResponse, 
  ApiCredentialMetaResponse,
} from './dto/api-credential-response.dto';
import { AuthenticationContext } from '../../common/types/auth/authentication-context.type';
import { Environment } from '../../common/enums/api-credentials.enums';
import { createHash, randomBytes } from 'crypto';
import {ApiCredential} from '@prisma/client'

@Injectable()
export class ApiCredentialsService {
  constructor(private readonly prisma: PrismaService) {}


  private generateRawKey(environment: Environment): string {
    const envSlug = environment === Environment.LIVE ? 'live' : 'test';
    const secret = randomBytes(32).toString('hex');
    return `pl_${envSlug}_${secret}`;
  }

  private extractPrefix(rawKey: string): string {
    const parts = rawKey.split('_');
    const secretSnippet = parts[2].slice(0, 4);
    return `pl_${parts[1]}_${secretSnippet}`;
  }

  private hashKey(rawKey: string): string {
    return createHash('sha256').update(rawKey).digest('hex');
  }


  async create(
    merchantId: string, dto: CreateApiCredentialDto
  ): Promise<ApiCredentialCreatedResponse> {
    const rawKey = this.generateRawKey(dto.environment);
    const keyHash = this.hashKey(rawKey);
    const keyPrefix = this.extractPrefix(rawKey);

    const credential = await this.prisma.apiCredential.create({
      data: {
        merchantId,
        name: dto.name,
        environment: dto.environment,
        keyPrefix,
        keyHash,
        isActive: true,
      },
    });

    return {
      ...this.toCredentialResponse(credential),
      apiKey: rawKey,
    };
  }


  async findAll(merchantId: string): Promise<ApiCredentialMetaResponse[]> {
    const credentials = await this.prisma.apiCredential.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });
    return credentials.map(this.toCredentialResponse);
  }


  async findOne(id: string, merchantId: string): Promise<ApiCredentialMetaResponse> {
    const credential = await this.prisma.apiCredential.findFirst({
      where: { id, merchantId },
    });
    if (!credential) throw new NotFoundException('API key not found');
    return this.toCredentialResponse(credential);
  }


  async update(
    id: string, merchantId: string, dto: UpdateApiCredentialDto,
  ): Promise<ApiCredentialMetaResponse> {
    await this.assertOwnership(id, merchantId);
    const updated = await this.prisma.apiCredential.update({
      where: { id },
      data: { name: dto.name },
    });
    return this.toCredentialResponse(updated);
  }


  async revoke(id: string, merchantId: string): Promise<void> {
    await this.assertOwnership(id, merchantId);
    await this.prisma.apiCredential.update({
      where: { id },
      data: { isActive: false },
    });
  }


  async validateApiKey(rawKey: string): Promise<AuthenticationContext> {
    const keyHash = this.hashKey(rawKey);

    const credential = await this.prisma.apiCredential.findUnique({
      where: { keyHash },
      select: {
        id: true,
        merchantId: true,
        environment: true,
        isActive: true,
        expiresAt: true,
      },
    });

    if (!credential) throw new UnauthorizedException('Invalid API key');

    if (!credential.isActive) {
      throw new UnauthorizedException('API key has been revoked');
    }

    if (credential.expiresAt && credential.expiresAt < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    this.updateLastUsed(credential.id).catch(() => {
      // Silently ignore — lastUsedAt is best-effort auditing, not critical
    });

    return {
      merchantId: credential.merchantId,
      environment: credential.environment as Environment,
      apiCredentialId: credential.id,
    };
  }


  private async updateLastUsed(credentialId: string): Promise<void> {
    await this.prisma.apiCredential.update({
      where: { id: credentialId },
      data: { lastUsedAt: new Date() },
    });
  }


  private async assertOwnership(id: string, merchantId: string): Promise<void> {
    const credential = await this.prisma.apiCredential.findFirst({
      where: { id, merchantId },
      select: { id: true },
    });
    if (!credential) {
      throw new NotFoundException('API key not found');
    }
  }

 
  private toCredentialResponse(credential: ApiCredential): ApiCredentialMetaResponse {
    return {
      id: credential.id,
      name: credential.name,
      environment: credential.environment as Environment,
      keyPrefix: credential.keyPrefix,
      isActive: credential.isActive,
      lastUsedAt: credential.lastUsedAt,
      expiresAt: credential.expiresAt,
      createdAt: credential.createdAt,
    };
  }
}
