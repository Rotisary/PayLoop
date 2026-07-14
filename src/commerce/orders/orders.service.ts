import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Order, OrderStatus, Environment } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderRequest } from './types/create-order.types';

 
@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) {}

    async create(
        merchantId: string,
        environment: Environment,
        data: CreateOrderRequest
    ): Promise<Order> {
        return this.prisma.order.create({
            data: {
                merchantId: merchantId,
                environment: environment,
                subscriptionId: data.subscriptionId,
                customerId: data.customerId,
                amount: data.amount,
                currency: data.currency,
                billingPeriodStart: data.billingPeriodStart,
                billingPeriodEnd: data.billingPeriodEnd,
                metadata: data.metadata,
                status: OrderStatus.PENDING,
            },
        });
    }

    async findOne(
        merchantId: string, environment: Environment, orderId: string,
    ): Promise<Order> {
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                merchantId,
                environment,
            },
        });

        if (!order) {
            throw new NotFoundException(`Order ${orderId} not found`);
        }

        return order;
    }

    async findByMerchant(
        merchantId: string, environment: Environment, status?: OrderStatus,
    ): Promise<Order[]> {

        return this.prisma.order.findMany({
            where: {
                merchantId,
                environment,
                ...(status ? { status } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async markPaymentProcessing(    
        merchantId: string, environment: Environment, orderId: string
    ): Promise<Order> {
        return this.transitionStatus(
            merchantId, 
            environment, 
            orderId,
            [OrderStatus.PENDING, OrderStatus.FAILED],
            OrderStatus.PAYMENT_PROCESSING
        );
    }

    async markPaid(
        merchantId: string, environment: Environment, orderId: string
    ): Promise<Order> {
        return this.transitionStatus(            
            merchantId, 
            environment, 
            orderId,
            [OrderStatus.PAYMENT_PROCESSING],
            OrderStatus.PAID
        );
    }

    async markFailed(        
        merchantId: string, environment: Environment, orderId: string
    ): Promise<Order> {
        return this.transitionStatus(
            merchantId, 
            environment, 
            orderId,
            [OrderStatus.PAYMENT_PROCESSING],
            OrderStatus.FAILED
        );
    }

    async markFulfilled(
        merchantId: string, environment: Environment, orderId: string
    ): Promise<Order> {
        return this.transitionStatus(
            merchantId, 
            environment, 
            orderId,
            [OrderStatus.PAID],
            OrderStatus.FULFILLED
        );
    }

    async cancel(
        merchantId: string, environment: Environment, orderId: string
    ): Promise<Order> {
        return this.transitionStatus(
            merchantId, 
            environment, 
            orderId,
            [OrderStatus.PENDING, OrderStatus.PAID],
            OrderStatus.CANCELLED
        );
    }

    private async transitionStatus(
        merchantId: string,
        environment: Environment,
        orderId: string,
        allowedCurrentStatuses: OrderStatus[],
        to: OrderStatus,
    ): Promise<Order> {
        const order = await this.assertOrder(merchantId, environment, orderId);

        if (order.status === to) {
            throw new ConflictException('Order is already in the requested state');
        }

        if (!allowedCurrentStatuses.includes(order.status)) {
            throw new ConflictException(
                `Cannot transition order from ${order.status} to ${to}`,
            );
        }

        return this.prisma.order.update({
            where: { id: orderId },
            data: { status: to },
        });
    }

    private async assertOrder(
        merchantId: string,
        environment: Environment,
        orderId: string,
    ): Promise<Order> {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, merchantId, environment },
        });

        if (!order) {
            throw new NotFoundException('order not found');
        }

        return order;
    }
}
