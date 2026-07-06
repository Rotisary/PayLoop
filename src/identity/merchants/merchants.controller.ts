import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { type AuthenticatedMerchant } from '../../common/types/auth/authenticated-merchant.type';
import { CurrentMerchant } from '../../common/decorators/jwt-auth.decorator';
import { MerchantProfileDto } from './dto/merchant-profile.dto';
import { MerchantWithProfileDto } from './dto/merchant-with-profile.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { MerchantsService } from './merchants.service';


@ApiTags('Merchant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('merchant')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get merchant profile',
    description: 'Retrieve the profile information for the authenticated merchant.',
  })
  @ApiOkResponse({ type: MerchantWithProfileDto })
  getMe(@CurrentMerchant() merchant: AuthenticatedMerchant) {
    return this.merchantsService.getMe(merchant.merchantId);
  }

  @Post('onboarding')
  @ApiOperation({
    summary: 'Complete onboarding',
    description: 'Finalize the merchant onboarding process.',
  })
  @ApiOkResponse({ type: MerchantWithProfileDto })
  completeOnboarding(
    @CurrentMerchant() merchant: AuthenticatedMerchant,
    @Body() dto: MerchantProfileDto,
  ) {
    return this.merchantsService.completeOnboarding(
      merchant.merchantId,
      dto,
    );
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update merchant information',
    description: 'Update the information for the authenticated merchant.',
  })
  @ApiOkResponse({ type: MerchantWithProfileDto })
  updateMe(
    @CurrentMerchant() merchant: AuthenticatedMerchant,
    @Body() dto: UpdateMerchantDto,
  ) {
    return this.merchantsService.updateMe(merchant.merchantId, dto);
  }

  @Patch('profile/me')
  @ApiOperation({
    summary: 'Update merchant profile',
    description: 'Update the profile information for the authenticated merchant.',
  })
  @ApiOkResponse({ type: MerchantWithProfileDto })
  updateProfile(
    @CurrentMerchant() merchant: AuthenticatedMerchant,
    @Body() dto: MerchantProfileDto,
  ) {
    return this.merchantsService.updateProfile(merchant.merchantId, dto);
  }
}
