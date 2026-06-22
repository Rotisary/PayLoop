import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MerchantResponseDto } from '../../auth/dto/auth-response.dto';

export class MerchantProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  merchantId!: string;

  @ApiPropertyOptional()
  industry!: string | null;

  @ApiPropertyOptional()
  website!: string | null;

  @ApiPropertyOptional()
  businessDescription!: string | null;

  @ApiPropertyOptional()
  addressLine1!: string | null;

  @ApiPropertyOptional()
  addressLine2!: string | null;

  @ApiPropertyOptional()
  city!: string | null;

  @ApiPropertyOptional()
  state!: string | null;

  @ApiPropertyOptional()
  country!: string | null;

  @ApiPropertyOptional()
  postalCode!: string | null;

  @ApiPropertyOptional()
  supportEmail!: string | null;

  @ApiPropertyOptional()
  supportPhone!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class MerchantWithProfileDto extends MerchantResponseDto {
  @ApiPropertyOptional({ type: MerchantProfileResponseDto, nullable: true })
  profile!: MerchantProfileResponseDto | null;
}
