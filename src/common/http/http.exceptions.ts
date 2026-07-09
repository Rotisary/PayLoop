import { HttpException, HttpStatus } from '@nestjs/common';

interface ExternalServiceErrorBody {
  message: string;
  provider?: string;
  upstreamStatus?: number;
}

export class ExternalServiceException extends HttpException {
  constructor(
    message = 'External service request failed',
    provider?: string,
    upstreamStatus?: number,
  ) {
    super(
      {
        message,
        provider,
        upstreamStatus,
        error: 'ExternalServiceException',
      } satisfies ExternalServiceErrorBody & { error: string },
      HttpStatus.BAD_GATEWAY,
    );
  }
}

export class ExternalServiceTimeoutException extends HttpException {
  constructor(provider?: string, upstreamStatus?: number) {
    super(
      {
        message: 'External service request timed out',
        provider,
        upstreamStatus,
        error: 'ExternalServiceTimeoutException',
      } satisfies ExternalServiceErrorBody & { error: string },
      HttpStatus.GATEWAY_TIMEOUT,
    );
  }
}

export class ExternalServiceUnavailableException extends HttpException {
  constructor(provider?: string, upstreamStatus?: number) {
    super(
      {
        message: 'External service is unavailable',
        provider,
        upstreamStatus,
        error: 'ExternalServiceUnavailableException',
      } satisfies ExternalServiceErrorBody & { error: string },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class ExternalServiceUnauthorizedException extends HttpException {
  constructor(provider?: string, upstreamStatus?: number) {
    super(
      {
        message: 'External service rejected the request',
        provider,
        upstreamStatus,
        error: 'ExternalServiceUnauthorizedException',
      } satisfies ExternalServiceErrorBody & { error: string },
      HttpStatus.BAD_GATEWAY,
    );
  }
}
