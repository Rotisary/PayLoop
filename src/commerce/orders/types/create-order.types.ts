import { Prisma } from '@prisma/client';

 
export interface CreateOrderRequest {
  subscriptionId: string;
  customerId: string;
  amount: number;
  currency: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  metadata?: Prisma.InputJsonValue;
}