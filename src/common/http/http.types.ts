export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpHeaders = Record<string, string>;

export type HttpQueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface HttpRequestOptions<TBody = unknown> {
  headers?: HttpHeaders;
  params?: HttpQueryParams;
  body?: TBody;
  timeout?: number;
  provider?: string;
}

export interface HttpRequestContext {
  method: HttpMethod;
  url: string;
  provider?: string;
}
