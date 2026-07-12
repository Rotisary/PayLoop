import { Inject, Injectable } from '@nestjs/common';
import { HttpClient } from '../../common/http/http.service';
import {
  ExternalServiceException,
  ExternalServiceUnauthorizedException,
} from '../../common/http/http.exceptions';
import { 
  MonoCreateMandateRequest,
  MonoCreateMandateResponse
} from './types/mono-mandate.types';
import { MONO_CONFIG, type MonoConfig } from './mono.config';
import { MONO_PROVIDER_NAME, MonoMappedMandateResponse } from './types/mono.types';

@Injectable()
export class MonoService {
  constructor(
    private readonly httpService: HttpClient,
    @Inject(MONO_CONFIG)
    private readonly monoConfig: MonoConfig,
  ) {}

  async createMandate(request: MonoCreateMandateRequest): Promise<MonoMappedMandateResponse> {
    this.assertConfigured();

    const response = await this.httpService.post<MonoCreateMandateResponse>(
      this.monoConfig.baseUrl,
      request,
      {
        headers: this.buildHeaders(),
        provider: MONO_PROVIDER_NAME,
      },
    );

    return this.mapMandateResponse(response);
  }

  private buildHeaders(): Record<string, string> {
    return {
      'accept': 'application/json',
      'content-type': 'application/json',
      'mono-sec-key': this.monoConfig.secretKey,
    };
  }

  private assertConfigured(): void {
    if (!this.monoConfig.baseUrl) {
      throw new ExternalServiceException(
        'Mono base URL is not configured',
        MONO_PROVIDER_NAME,
      );
    }

    if (!this.monoConfig.secretKey) {
      throw new ExternalServiceUnauthorizedException(MONO_PROVIDER_NAME);
    }
  }

  private mapMandateResponse(
    response: MonoCreateMandateResponse,
  ): MonoMappedMandateResponse {
    return {
      provider: MONO_PROVIDER_NAME,
      data: {
        mandateId: response.data.mandate_id,
        reference: response.data.reference,
        status: response.status,
        authorizationUrl: response.data.mono_url,
        createdAt: response.data.created_at,
      },
    };
  }
}
