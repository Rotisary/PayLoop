import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Environment } from '../../../common/enums/api-credentials.enums';

export class CreateApiCredentialDto {
  @ApiProperty({
    example: 'Production Backend',
    description: 'Human-readable label for this API key',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    enum: Environment,
    example: Environment.LIVE,
    description: 'Which environment this key grants access to',
  })
  @IsEnum(Environment)
  environment!: Environment;
}