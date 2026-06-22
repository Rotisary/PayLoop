import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MerchantProfileDto } from './dto/merchant-profile.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { merchantWithProfileInclude } from './constants';
import { MerchantWithProfile } from './types';

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: merchantWithProfileInclude,
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return this.toMerchantWithProfileResponse(merchant);
  }

  async completeOnboarding(merchantId: string, dto: MerchantProfileDto) {
    const merchant = await this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        onboardingComplete: true,
        profile: {
          upsert: {
            create: dto,
            update: dto,
          },
        },
      },
      include: merchantWithProfileInclude,
    });

    return this.toMerchantWithProfileResponse(merchant);
  }

  async updateMe(merchantId: string, dto: UpdateMerchantDto) {
    const merchant = await this.prisma.merchant.update({
      where: { id: merchantId },
      data: dto,
      include: merchantWithProfileInclude,
    });

    return this.toMerchantWithProfileResponse(merchant);
  }

  async updateProfile(merchantId: string, dto: MerchantProfileDto) {
    const profile = await this.prisma.merchantProfile.findUnique({
      where: { merchantId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Merchant profile not found');
    }

    const merchant = await this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        profile: {
          update: dto,
        },
      },
      include: merchantWithProfileInclude,
    });

    return this.toMerchantWithProfileResponse(merchant);
  }

  private toMerchantWithProfileResponse(merchant: MerchantWithProfile) {
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
      profile: merchant.profile,
    };
  }
}
