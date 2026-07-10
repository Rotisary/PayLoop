import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';
import { Environment } from '../../common/enums/api-credentials.enums';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {

  constructor(private readonly prisma: PrismaService) {}

  async findByExternalId(
    merchantId: string,
    environment: Environment,
    externalProductId: string,
  ): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: {
        merchantId_environment_externalProductId: {
          merchantId,
          environment,
          externalProductId,
        },
      },
    });
  }

  async upsertProduct(
    merchantId: string, dto: CreateProductDto, environment: Environment,
  ): Promise<Product> {
    return this.prisma.product.upsert({
      where: {
        merchantId_environment_externalProductId: {
          merchantId,
          environment,
          externalProductId: dto.externalProductId,
        },
      },
      create: {
        merchantId,
        environment,
        name: dto.name,
        price: dto.price,
        externalProductId: dto.externalProductId,
        sku: dto.sku,
        description: dto.description,
      },
      update: {
        name: dto.name,
        price: dto.price,
        sku: dto.sku,
        description: dto.description,
      },
    });
  }

  async updateSalesCount(productId: string, amount = 1): Promise<Product> {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        salesCount: {
          increment: amount,
        },
      },
    });
  }

  async findById(merchantId: string, productId: string): Promise<Product> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        merchantId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}
