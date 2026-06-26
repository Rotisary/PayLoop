import { ApiProperty } from '@nestjs/swagger';
import { Environment } from '../../../common/enums/api-credentials.enums';

export class ApiCredentialMetaResponse {
  @ApiProperty({ example: 'clx1234abcd' })
  id!: string;

  @ApiProperty({ example: 'Production Backend' })
  name!: string;

  @ApiProperty({ enum: Environment, example: Environment.LIVE })
  environment!: Environment;

  @ApiProperty({ example: 'pl_live_a8c9' })
  keyPrefix!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: null, nullable: true })
  lastUsedAt!: Date | null;

  @ApiProperty({ example: null, nullable: true })
  expiresAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;
}

export class ApiCredentialCreatedResponse extends ApiCredentialMetaResponse {
  @ApiProperty({
    example: 'pl_live_a8c9f1e7f4b2d3e6c5a0...',
    description:
      'Raw API key — shown exactly once. Store it securely. Cannot be recovered.',
  })
  apiKey!: string;
}