import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ApiCredentialsService } from './api-credentials.service';
import { CreateApiCredentialDto } from './dto/create-api-credential.dto';
import { UpdateApiCredentialDto } from './dto/update-api-credential.dto';
import {
  ApiCredentialCreatedResponse,
  ApiCredentialMetaResponse,
} from './dto/api-credential-response.dto';

import { type AuthenticatedMerchant } from '../../common/types/auth/authenticated-merchant.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentMerchant } from '../../common/decorators/jwt-auth.decorator';


@ApiTags('API Keys (Dashboard)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api-keys')
export class ApiCredentialsController {
  constructor(private readonly apiKeysService: ApiCredentialsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create API key',
    description: [
      'Creates a new API key for the authenticated merchant.',
      'The raw key is returned **exactly once** in this response.',
      'It cannot be recovered afterward. Store it securely.',
    ].join(' '),
  })
  @ApiCreatedResponse({
    type: ApiCredentialCreatedResponse,
    description: 'API key created. Save the apiKey field — it will not be shown again.',
  })
  create(
    @CurrentMerchant() merchant: AuthenticatedMerchant,
    @Body() dto: CreateApiCredentialDto,
  ): Promise<ApiCredentialCreatedResponse> {
    return this.apiKeysService.create(merchant.merchantId, dto);
  }


  @Get()
  @ApiOperation({
    summary: 'List API keys',
    description: 'Returns metadata for all API keys belonging to the merchant. Raw keys are never returned.',
  })
  @ApiOkResponse({ type: [ApiCredentialMetaResponse] })
  findAll(
    @CurrentMerchant() merchant: AuthenticatedMerchant
  ): Promise<ApiCredentialMetaResponse[]> {
    return this.apiKeysService.findAll(merchant.merchantId);
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get API key by ID' })
  @ApiOkResponse({ type: ApiCredentialMetaResponse })
  findOne(
    @CurrentMerchant() merchant: AuthenticatedMerchant,
    @Param('id') id: string,
  ): Promise<ApiCredentialMetaResponse> {
    return this.apiKeysService.findOne(id, merchant.merchantId);
  }


  @Patch(':id')
  @ApiOperation({
    summary: 'Rename API key',
    description: 'Only the name can be updated. Environment cannot be changed after creation.',
  })
  @ApiOkResponse({ type: ApiCredentialMetaResponse })
  update(
    @CurrentMerchant() merchant: AuthenticatedMerchant,
    @Param('id') id: string,
    @Body() dto: UpdateApiCredentialDto,
  ): Promise<ApiCredentialMetaResponse> {
    return this.apiKeysService.update(id, merchant.merchantId, dto);
  }


  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Revoke API key',
    description: 'Permanently revokes the API key. Requests using this key will immediately start failing. This action cannot be undone.',
  })
  @ApiNoContentResponse({ description: 'Key revoked successfully' })
  revoke(
    @CurrentMerchant() merchant: AuthenticatedMerchant,
    @Param('id') id: string,
  ): Promise<void> {
    return this.apiKeysService.revoke(id, merchant.merchantId);
  }
}
