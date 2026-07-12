export const MONO_PROVIDER_NAME = 'mono' as const;

export type MonoProviderName = typeof MONO_PROVIDER_NAME;

export interface MandateResponse {
  mandateId: string;
  reference: string;
  status: string;
  authorizationUrl: string;
  createdAt: string;
}

export interface MonoMappedMandateResponse {
  provider: MonoProviderName;
  data: MandateResponse;
}
