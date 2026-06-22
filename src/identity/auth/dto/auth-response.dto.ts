import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MerchantResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  businessName!: string;

  @ApiPropertyOptional()
  contactName!: string | null;

  @ApiPropertyOptional()
  phone!: string | null;

  @ApiProperty()
  onboardingComplete!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class AuthResponseDto {
  @ApiProperty({ type: MerchantResponseDto })
  merchant!: MerchantResponseDto;

  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;
}
