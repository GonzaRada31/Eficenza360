import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectModulesService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, projectId: string, data: any) {
    return this.prisma.projectModule.create({
      data: {
        ...data,
        projectId,
      },
    });
  }

  findAll(tenantId: string, projectId: string) {
    return this.prisma.projectModule.findMany({
      where: {
        projectId,
        project: { tenantId },
      },
      orderBy: { orderIndex: 'asc' },
      include: {
        tasks: true,
      },
    });
  }

  findOne(tenantId: string, id: string) {
    return this.prisma.projectModule.findFirst({
      where: {
        id,
        project: { tenantId },
      },
    });
  }

  update(tenantId: string, id: string, data: any) {
    // Ensure the module belongs to a project in the tenant
    return this.prisma.projectModule.updateMany({
      where: {
        id,
        project: { tenantId },
      },
      data,
    });
  }

  remove(tenantId: string, id: string) {
    return this.prisma.projectModule.deleteMany({
      where: {
        id,
        project: { tenantId },
      },
    });
  }
}
