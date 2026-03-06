import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectModulesService {
  constructor(private prisma: PrismaService) {}

  create(
    tenantId: string,
    projectId: string,
    data: Prisma.ProjectModuleUncheckedCreateInput,
  ) {
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
        deletedAt: null,
      },
      orderBy: { orderIndex: 'asc' },
      include: {
        tasks: {
          where: { deletedAt: null },
        },
      },
    });
  }

  findOne(tenantId: string, id: string) {
    return this.prisma.projectModule.findFirst({
      where: {
        id,
        project: { tenantId },
        deletedAt: null,
      },
    });
  }

  update(
    tenantId: string,
    id: string,
    data: Prisma.ProjectModuleUncheckedUpdateInput,
  ) {
    // Ensure the module belongs to a project in the tenant
    return this.prisma.projectModule.updateMany({
      where: {
        id,
        project: { tenantId },
        deletedAt: null,
      },
      data,
    });
  }

  remove(tenantId: string, id: string) {
    return this.prisma.projectModule.updateMany({
      where: {
        id,
        project: { tenantId },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
