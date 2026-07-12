import { Injectable, NotFoundException } from '@nestjs/common';
import { Customer } from '@prisma/client';
import { Environment } from '../../common/enums/api-credentials.enums';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    merchantId: string, environment: Environment, dto: CreateCustomerDto
  ): Promise<Customer> {
    return this.prisma.customer.create({
      data: {
        merchantId,
        environment,
        name: dto.name,
        bankName: dto.bankName,
        bankAccountNumber: dto.bankAccountNumber,
        // providerCustomerId: dto.providerCustomerId,
      },
    });
  }

  async findAll(merchantId: string, environment: Environment): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      where: { merchantId, environment },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(merchantId: string, environment: Environment, customerId: string): Promise<Customer> {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, merchantId, environment },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(
    merchantId: string, environment: Environment, customerId: string, dto: UpdateCustomerDto,
  ): Promise<Customer> {
    await this.findOne(merchantId, environment, customerId);

    return this.prisma.customer.update({
      where: { id: customerId },
      data: dto,
    });
  }

  async remove(merchantId: string, environment: Environment, customerId: string): Promise<void> {
    await this.findOne(merchantId, environment, customerId);

    await this.prisma.customer.delete({
      where: { id: customerId },
    });
  }
}