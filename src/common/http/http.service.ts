import { HttpService as NestHttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  ExternalServiceException,
  ExternalServiceTimeoutException,
  ExternalServiceUnauthorizedException,
  ExternalServiceUnavailableException,
} from './http.exceptions';
import { HTTP_DEFAULT_TIMEOUT_MS } from './http.constants';
import {
  HttpMethod,
  HttpRequestContext,
  HttpRequestOptions,
  HttpHeaders,
  HttpQueryParams,
} from './http.types';

@Injectable()
export class HttpClient {
  private readonly logger = new Logger(HttpClient.name);

  constructor(private readonly httpService: NestHttpService) {}

  get<TResponse>(url: string, options?: HttpRequestOptions): Promise<TResponse> {
    return this.request<TResponse>('GET', url, options);
  }

  post<TResponse, TBody = unknown>(
    url: string, body?: TBody, options?: HttpRequestOptions<TBody>,
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>('POST', url, {...options, body});
  }

  put<TResponse, TBody = unknown>(
    url: string, body?: TBody, options?: HttpRequestOptions<TBody>,
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>('PUT', url, {...options, body});
  }

  patch<TResponse, TBody = unknown>(
    url: string, body?: TBody, options?: HttpRequestOptions<TBody>,
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>('PATCH', url, {...options, body});
  }

  delete<TResponse, TBody = unknown>(
    url: string, options?: HttpRequestOptions<TBody>,
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>('DELETE', url, options);
  }

  private async request<TResponse, TBody = unknown>(
    method: HttpMethod, url: string, options?: HttpRequestOptions<TBody>,
  ): Promise<TResponse> {
    const startedAt = Date.now();
    const timeout = options?.timeout ?? this.resolveDefaultTimeout();
    const context: HttpRequestContext = {
      method,
      url,
      provider: options?.provider,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.request<TResponse>(
          this.buildRequestConfig(
            method,
            url,
            options?.headers,
            options?.params,
            options?.body,
            timeout,
          ),
        ),
      );

      this.logSuccess(context, response.status, Date.now() - startedAt);
      return response.data;
    } catch (error: unknown) {
      const exception = this.translateError(error, context);
      this.logFailure(context, this.extractUpstreamStatus(error), Date.now() - startedAt);
      throw exception;
    }
  }

  private buildRequestConfig<TBody>(
    method: HttpMethod,
    url: string,
    headers?: HttpHeaders,
    params?: HttpQueryParams,
    body?: TBody,
    timeout?: number,
  ): AxiosRequestConfig<TBody> {
    return {
      method,
      url,
      headers,
      params,
      data: body,
      timeout,
    };
  }

  private translateError(error: unknown, context: HttpRequestContext): Error {
    if (error instanceof AxiosError) {
      return this.translateAxiosError(error, context);
    }

    if (this.isAxiosError(error)) {
      return this.translateAxiosError(error, context);
    }

    return new ExternalServiceException(undefined, context.provider);
  }

  private translateAxiosError(
    error: AxiosError,
    context: HttpRequestContext,
  ): Error {
    if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
      return new ExternalServiceTimeoutException(context.provider, error.response?.status);
    }

    const status = error.response?.status;

    if (status === 401 || status === 403) {
      return new ExternalServiceUnauthorizedException(context.provider, status);
    }

    if (!status || status >= 500 || status === 408 || status === 429) {
      return new ExternalServiceUnavailableException(context.provider, status);
    }

    return new ExternalServiceException(undefined, context.provider, status);
  }

  private logSuccess(
    context: HttpRequestContext,
    status: number,
    durationMs: number,
  ): void {
    this.logger.log(this.formatLogMessage(context, status, durationMs));
  }

  private logFailure(
    context: HttpRequestContext,
    status: number | undefined,
    durationMs: number,
  ): void {
    this.logger.warn(this.formatLogMessage(context, status, durationMs));
  }

  private formatLogMessage(
    context: HttpRequestContext,
    status: number | undefined,
    durationMs: number,
  ): string {
    const providerLabel = context.provider ? ` provider=${context.provider}` : '';
    const statusLabel = status ? ` status=${status}` : '';
    return `[HttpService]${providerLabel} method=${context.method} url=${context.url}${statusLabel} durationMs=${durationMs}`;
  }

  private resolveDefaultTimeout(): number {
    const timeout = this.httpService.axiosRef.defaults.timeout;
    return typeof timeout === 'number' && !Number.isNaN(timeout)
      ? timeout
      : HTTP_DEFAULT_TIMEOUT_MS;
  }

  private extractUpstreamStatus(error: unknown): number | undefined {
    if (error instanceof AxiosError) {
      return error.response?.status;
    }

    if (this.isAxiosError(error)) {
      return error.response?.status;
    }

    return undefined;
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return typeof error === 'object' && error !== null && 'isAxiosError' in error;
  }
}
