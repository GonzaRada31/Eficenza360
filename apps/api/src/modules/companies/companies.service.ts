import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, data: any) {
    return this.prisma.company.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.company.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(tenantId: string, id: string) {
    return this.prisma.company.findFirst({
      where: { id, tenantId },
    });
  }

  update(tenantId: string, id: string, data: any) {
    return this.prisma.company.updateMany({
      where: { id, tenantId },
      data,
    });
  }

  remove(tenantId: string, id: string) {
    return this.prisma.company.deleteMany({
      where: { id, tenantId },
    });
  }
}
