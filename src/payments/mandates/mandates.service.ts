import { Injectable, NotFoundException } from '@nestjs/common';
import { Environment } from '../../common/enums/api-credentials.enums';
import { PrismaService } from '../../prisma/prisma.service';
import { MandateStatus, Mandate } from '@prisma/client';
import { MonoCreateMandateRequest } from '../../providers/mono/types/mono-mandate.types';
import { MonoService } from '../../providers/mono/mono.service';

@Injectable()
export class MandatesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly monoService: MonoService,
	) {}

	async createMandate(
		merchantId: string, 
        environment: Environment, 
        data: MonoCreateMandateRequest,
	): Promise<Mandate> {
        const mandate = await this.prisma.mandate.create({
			data: {
				merchantId,
				environment,
				status: MandateStatus.PENDING,
				startDate: new Date(data.start_date),
				endDate: new Date(data.end_date),
				customerId: data.customer.id,
				amount: data.amount,
			},          
        })
		const response = await this.monoService.createMandate(data);
        this.updateMetadata(mandate.id, response.data.mandateId, response.data.createdAt)
        return await this.updateStatus(merchantId, environment, mandate.id, MandateStatus.SUBMITTED)
	}

	async updateStatus(
		merchantId: string,
		environment: Environment,
		MandateId: string,
		status: MandateStatus,
	): Promise<Mandate> {
		const mandate = await this.prisma.mandate.findFirst({
			where: {
				merchantId,
				environment,
				MandateId,
			},
			select: { id: true },
		});

		if (!mandate) {
			throw new NotFoundException('Mandate not found');
		}

		return this.prisma.mandate.update({
			where: { id: mandate.id },
			data: { status },
		});
	}

	private updateMetadata(
        mandateId: string, 
        providerMandateId: string, 
        providerCreatedAt: string
	): void {
		void this.prisma.mandate.update({
			where: { id: mandateId },
			data: { providerMandateId, providerCreatedAt },
		}).catch((error) => {
            // add logs
        });
	}

	async getMandate(
		merchantId: string,
		environment: Environment,
		mandateId: string,
		status: MandateStatus,
	): Promise<Mandate> {
		const mandate = await this.prisma.mandate.findFirst({
			where: {
				id: mandateId,
				merchantId,
				environment,
				status,
			},
		});

		if (!mandate) {
			throw new NotFoundException('Mandate not found');
		}

		return mandate;
	}
}
