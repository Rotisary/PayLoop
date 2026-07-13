export const MONO_PROVIDER_NAME = 'mono' as const;

export type MonoProviderName = typeof MONO_PROVIDER_NAME;

export interface MandateResponse {
  mandateId: string;
  reference: string;
  status: string;
  message: string,
  authorizationUrl: string;
  createdAt: string;
}

export interface CustomerResponse {
  customerId: string;
  status: string;
  message: string;
}

export interface MonoMappedMandateResponse {
  provider: MonoProviderName;
  data: MandateResponse;
}

export interface MonoMappedCustomerResponse {
  provider: MonoProviderName;
  data: CustomerResponse;
}
