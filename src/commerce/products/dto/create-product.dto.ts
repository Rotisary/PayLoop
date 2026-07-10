import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Premium Subscription',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    example: 250000,
    description: 'Price in minor units, for example kobo',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price!: number;

  @ApiProperty({
    example: 'prod_12345',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  externalProductId!: string;

  @ApiPropertyOptional({
    example: 'SUB-001',
    maxLength: 64,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sku?: string;

  @ApiProperty({
    example: 'Short product description',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description!: string;
}