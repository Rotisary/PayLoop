import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { 
    Subscription,
    SubscriptionStatus,
    BillingInterval 
} from '@prisma/client';
import { Environment } from '../../common/enums/api-credentials.enums';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionRequest } from './types/create-subscription.types';


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
        status: SubscriptionStatus.PENDING,
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
    return this.transitionStatus(
      merchantId,
      environment,
      subscriptionId,
      [SubscriptionStatus.ACTIVE],
      SubscriptionStatus.PAUSED,
    );
  }

  async resume(
    merchantId: string, environment: Environment, subscriptionId: string,
  ): Promise<Subscription> {
    return this.transitionStatus(
      merchantId,
      environment,
      subscriptionId,
      [SubscriptionStatus.PAUSED],
      SubscriptionStatus.ACTIVE,
    );
  }

  async cancel(
    merchantId: string, environment: Environment, subscriptionId: string,
  ): Promise<Subscription> {
    return this.transitionStatus(
      merchantId,
      environment,
      subscriptionId,
      [
        SubscriptionStatus.ACTIVE,
        SubscriptionStatus.PAUSED,
        SubscriptionStatus.PAST_DUE,
      ],
      SubscriptionStatus.CANCELLED,
    );
  }

  async markPastDue(
    merchantId: string,
    environment: Environment,
    subscriptionId: string,
  ): Promise<Subscription> {
    return this.transitionStatus(
      merchantId,
      environment,
      subscriptionId,
      [SubscriptionStatus.ACTIVE],
      SubscriptionStatus.PAST_DUE,
    );
  }

  async reactivate(
    merchantId: string,
    environment: Environment,
    subscriptionId: string,
  ): Promise<Subscription> {
    return this.transitionStatus(
      merchantId,
      environment,
      subscriptionId,
      [SubscriptionStatus.PAST_DUE],
      SubscriptionStatus.ACTIVE,
    );
  }

  async advanceNextChargeDate(
    merchantId: string,
    environment: Environment,
    subscriptionId: string,
  ): Promise<Subscription> {
    const subscription = await this.assertSubscription(merchantId, environment, subscriptionId);

    const restrictedStatuses: SubscriptionStatus[] = [
      SubscriptionStatus.CANCELLED, SubscriptionStatus.PAUSED,
    ];
    if (restrictedStatuses.includes(subscription.status)) {
      throw new ConflictException('Cancelled or Paused subscriptions cannot advance billing dates');
    }

    const nextChargeDate = this.calculateNextChargeDate(
      subscription.nextChargeDate,
      subscription.billingInterval,
    );

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { nextChargeDate },
    });
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
        status: SubscriptionStatus.ACTIVE,
        nextChargeDate: {
          lte: dueBefore,
        },
      },
      orderBy: { nextChargeDate: 'asc' },
    });
  }

  private async transitionStatus(
    merchantId: string,
    environment: Environment,
    subscriptionId: string,
    allowedCurrentStatuses: SubscriptionStatus[],
    status: SubscriptionStatus,
  ): Promise<Subscription> {
    const subscription = await this.assertSubscription(merchantId, environment, subscriptionId);

    if (subscription.status === status) {
      throw new ConflictException('Subscription is already in the requested state');
    }

    if (!allowedCurrentStatuses.includes(subscription.status)) {
      throw new ConflictException(
        `Cannot transition subscription from ${subscription.status} to ${status}`,
      );
    }

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status },
    });
  }

  private async assertSubscription(
    merchantId: string,
    environment: Environment,
    subscriptionId: string,
  ): Promise<Subscription> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id: subscriptionId, merchantId, environment },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  private calculateNextChargeDate(
    currentNextChargeDate: Date,
    billingInterval: BillingInterval,
  ): Date {
    const nextChargeDate = new Date(currentNextChargeDate);

    switch (billingInterval) {
      case BillingInterval.DAILY:
        nextChargeDate.setDate(nextChargeDate.getDate() + 1);
        return nextChargeDate;
      case BillingInterval.WEEKLY:
        nextChargeDate.setDate(nextChargeDate.getDate() + 7);
        return nextChargeDate;
      case BillingInterval.MONTHLY:
        nextChargeDate.setMonth(nextChargeDate.getMonth() + 1);
        return nextChargeDate;
      case BillingInterval.YEARLY:
        nextChargeDate.setFullYear(nextChargeDate.getFullYear() + 1);
        return nextChargeDate;
      case BillingInterval.CUSTOM:
        throw new ConflictException(
          'CUSTOM billing interval requires explicit next charge date management',
        );
      default:
        throw new ConflictException(`Unsupported billing interval: ${billingInterval}`);
    }
  }
}