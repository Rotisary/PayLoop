import { BillingInterval } from '@prisma/client';
import { Prisma } from '@prisma/client';


export interface CreateSubscriptionRequest {
  customerId: string;
  mandateId: string;
  productIds: string[];
  billingInterval: BillingInterval;
  nextChargeDate: Date;
  metadata?: Prisma.InputJsonValue;
}