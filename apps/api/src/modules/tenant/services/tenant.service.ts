import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from '../dto/tenant.dto';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.name,
          commercialName: dto.commercialName,
          logoUrl: dto.logoUrl,
          status: 'ACTIVE',
        }
      });

      // Default roles provisioning
      await tx.role.create({
        data: {
          tenantId: tenant.id,
          name: 'Admin',
          description: 'Full administrative access',
          isSystem: true,
        }
      });

      await tx.domainEventOutbox.create({
        data: {
          tenantId: tenant.id, // Emitted context is the new tenant
          eventType: 'TENANT_CREATED',
          payload: { tenantId: tenant.id, name: tenant.name }
        }
      });

      return tenant;
    });
  }

  async findAll() {
    return this.prisma.tenantClient.tenant.findMany();
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenantClient.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    return this.prisma.tenantClient.tenant.update({
      where: { id },
      data: dto,
    });
  }

  async suspend(id: string) {
    return this.prisma.tenantClient.tenant.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });
  }

  async activate(id: string) {
    return this.prisma.tenantClient.tenant.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
  }
}
