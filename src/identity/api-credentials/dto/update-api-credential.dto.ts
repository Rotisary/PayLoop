import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApiCredentialDto {
  @ApiProperty({
    example: 'Production Backend v2',
    description: 'New label for the API key',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}