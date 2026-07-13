import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Subscription } from '@prisma/client';
import { Environment } from '../../common/enums/api-credentials.enums';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionRequest } from './types/create-subscription.types';
import { BillingInterval } from './enums/billing-interval.enum';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    merchantId: string,
    environment: Environment,
    data: CreateSubscriptionRequest,
  ): Promise<Subscription> {
    const uniqueProductIds = [...new Set(data.productIds)];

    const [customer, mandate, products] = await Promise.all([
      this.prisma.customer.findFirst({
        where: { id: data.customerId, merchantId, environment },
        select: { id: true },
      }),
      this.prisma.mandate.findFirst({
        where: { id: data.mandateId, merchantId, environment },
        select: { id: true, customerId: true },
      }),
      this.prisma.product.findMany({
        where: {
          id: { in: uniqueProductIds },
          merchantId,
          environment,
        },
        select: { id: true, price: true },
      }),
    ]);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (!mandate) {
      throw new NotFoundException('Mandate not found');
    }

    if (mandate.customerId !== customer.id) {
      throw new BadRequestException('Mandate does not belong to customer');
    }

    if (products.length !== uniqueProductIds.length) {
      throw new NotFoundException('One or more products not found');
    }

    const amount = products.reduce((total, product) => total + product.price, 0);

    return this.prisma.subscription.create({
      data: {
        merchantId,
        environment,
        customerId: customer.id,
        mandateId: mandate.id,
        amount,
        billingInterval: data.billingInterval as BillingInterval,
        nextChargeDate: data.nextChargeDate,
        status: SubscriptionStatus.ACTIVE,
        metadata: data.metadata,
        products: {
          connect: uniqueProductIds.map((id) => ({ id })),
        },
      },
    });
  }

  async findOne(
    merchantId: string, environment: Environment, subscriptionId: string,
  ): Promise<Subscription> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id: subscriptionId, merchantId, environment },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async findByMerchant(
    merchantId: string, environment: Environment, status?: SubscriptionStatus,
  ): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({
      where: {
        merchantId,
        environment,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async pause(
    merchantId: string, environment: Environment, subscriptionId: string,
  ): Promise<Subscription> {
    return this.updateStatus(merchantId, environment, subscriptionId, SubscriptionStatus.PAUSED);
  }

  async resume(
    merchantId: string, environment: Environment, subscriptionId: string,
  ): Promise<Subscription> {
    return this.updateStatus(merchantId, environment, subscriptionId, SubscriptionStatus.ACTIVE);
  }

  async cancel(
    merchantId: string, environment: Environment, subscriptionId: string,
  ): Promise<Subscription> {
    return this.updateStatus(merchantId, environment, subscriptionId, SubscriptionStatus.CANCELLED);
  }

  async markPastDue(
    merchantId: string,
    environment: Environment,
    subscriptionId: string,
  ): Promise<Subscription> {
    return this.updateStatus(merchantId, environment, subscriptionId, SubscriptionStatus.PAST_DUE);
  }

  async updateNextChargeDate(
    merchantId: string,
    environment: Environment,
    subscriptionId: string,
    nextChargeDate: Date,
  ): Promise<Subscription> {
    await this.assertSubscription(merchantId, environment, subscriptionId);

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { nextChargeDate },
    });
  }

  async findDueSubscriptions(
    merchantId: string,
    environment: Environment,
    dueBefore = new Date(),
  ): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({
      where: {
        merchantId,
        environment,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE],
        },
        nextChargeDate: {
          lte: dueBefore,
        },
      },
      orderBy: { nextChargeDate: 'asc' },
    });
  }

  private async updateStatus(
    merchantId: string,
    environment: Environment,
    subscriptionId: string,
    status: SubscriptionStatus,
  ): Promise<Subscription> {
    await this.assertSubscription(merchantId, environment, subscriptionId);

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status },
    });
  }

  private async assertSubscription(
    merchantId: string,
    environment: Environment,
    subscriptionId: string,
  ): Promise<void> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id: subscriptionId, merchantId, environment },
      select: { id: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
  }
}