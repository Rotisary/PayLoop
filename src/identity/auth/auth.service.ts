import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_TTL_MS,
} from './constants';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedMerchant } from '../../common/types/auth/authenticated-merchant.type';
import { RefreshTokenPayload } from '../../common/types/auth/token-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const existingMerchant = await this.prisma.merchant.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingMerchant) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await argon2.hash(dto.password);
    const merchant = await this.prisma.merchant.create({
      data: {
        email,
        passwordHash,
        businessName: dto.businessName,
        contactName: dto.contactName,
        phone: dto.phone,
      },
    });

    const tokens = await this.issueTokenPair(merchant.id, merchant.email);

    return {
      merchant: this.toMerchantResponse(merchant),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!merchant?.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await argon2.verify(
      merchant.passwordHash,
      dto.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokenPair(merchant.id, merchant.email);

    return {
      merchant: this.toMerchantResponse(merchant),
      ...tokens,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
      include: { merchant: true },
    });

    if (
      !storedToken ||
      storedToken.revoked ||
      storedToken.expiresAt <= new Date() ||
      storedToken.merchantId !== payload.sub ||
      !storedToken.merchant.isActive
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenMatches = await argon2.verify(
      storedToken.tokenHash,
      dto.refreshToken,
    );

    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newTokens = await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });

      return this.issueTokenPair(
        storedToken.merchant.id,
        storedToken.merchant.email,
        tx,
      );
    });

    return {
      merchant: this.toMerchantResponse(storedToken.merchant),
      ...newTokens,
    };
  }

  async logout(dto: RefreshTokenDto, merchant: AuthenticatedMerchant) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);

    if (payload.sub !== merchant.merchantId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
    });

    if (!storedToken || storedToken.merchantId !== merchant.merchantId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenMatches = await argon2.verify(
      storedToken.tokenHash,
      dto.refreshToken,
    );

    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    return { success: true };
  }

  private async issueTokenPair(
    merchantId: string,
    email: string,
    client: Pick<PrismaService, 'refreshToken'> = this.prisma,
  ) {
    const refreshTokenId = randomUUID();

    const accessToken = await this.jwtService.signAsync(
      { sub: merchantId, email },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: merchantId, email, tokenId: refreshTokenId },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      },
    );
    const tokenHash = await argon2.hash(refreshToken);

    await client.refreshToken.create({
      data: {
        id: refreshTokenId,
        merchantId,
        tokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      return await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private toMerchantResponse(merchant: {
    id: string;
    email: string;
    businessName: string;
    contactName: string | null;
    phone: string | null;
    onboardingComplete: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: merchant.id,
      email: merchant.email,
      businessName: merchant.businessName,
      contactName: merchant.contactName,
      phone: merchant.phone,
      onboardingComplete: merchant.onboardingComplete,
      isActive: merchant.isActive,
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt,
    };
  }
}
