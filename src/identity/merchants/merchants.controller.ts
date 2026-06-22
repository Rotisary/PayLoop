import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedMerchant } from '../auth/types/authenticated-merchant.type';
import { MerchantProfileDto } from './dto/merchant-profile.dto';
import { MerchantWithProfileDto } from './dto/merchant-with-profile.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { MerchantsService } from './merchants.service';

type AuthenticatedRequest = Request & { user: AuthenticatedMerchant };

@ApiTags('Merchant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('merchant')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get('me')
  @ApiOkResponse({ type: MerchantWithProfileDto })
  getMe(@Req() request: AuthenticatedRequest) {
    return this.merchantsService.getMe(request.user.merchantId);
  }

  @Post('onboarding')
  @ApiOkResponse({ type: MerchantWithProfileDto })
  completeOnboarding(
    @Req() request: AuthenticatedRequest,
    @Body() dto: MerchantProfileDto,
  ) {
    return this.merchantsService.completeOnboarding(
      request.user.merchantId,
      dto,
    );
  }

  @Patch('me')
  @ApiOkResponse({ type: MerchantWithProfileDto })
  updateMe(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateMerchantDto,
  ) {
    return this.merchantsService.updateMe(request.user.merchantId, dto);
  }

  @Patch('profile/me')
  @ApiOkResponse({ type: MerchantWithProfileDto })
  updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: MerchantProfileDto,
  ) {
    return this.merchantsService.updateProfile(request.user.merchantId, dto);
  }
}
