import { BillingInterval } from "../enums/billing-interval.enum";
import { Prisma } from '@prisma/client';


export interface CreateSubscriptionRequest {
  customerId: string;
  mandateId: string;
  productIds: string[];
  billingInterval: BillingInterval;
  nextChargeDate: Date;
  metadata?: Prisma.InputJsonValue;
}