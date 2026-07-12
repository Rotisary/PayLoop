import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Jane Doe', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'Zenith Bank', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  bankName!: string;

  @ApiProperty({ example: '0123456789', maxLength: 32 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  bankAccountNumber!: string;
}