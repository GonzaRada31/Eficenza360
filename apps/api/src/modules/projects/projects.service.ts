import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PROJECT_TEMPLATES } from './project-templates';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(tenantId: string) {
    const activeProjects = await this.prisma.project.count({
      where: { tenantId, status: 'IN_PROGRESS' },
    });

    const completedProjects = await this.prisma.project.count({
      where: { tenantId, status: 'COMPLETE' },
    });

    // "Hallazgos Pendientes" could be mapped to Tasks/Subtasks that are pending
    const pendingTasks = await this.prisma.task.count({
      where: {
        project: { tenantId },
        status: 'PENDING',
      },
    });

    // "Items en Revisión" could be another status or specific task type
    const itemsInReview = await this.prisma.task.count({
      where: {
        project: { tenantId },
        // Assuming 'PENDING' for now, or could add a REVIEW status later
        status: 'IN_PROGRESS',
      },
    });

    return {
      activeProjects,
      completedProjects,
      pendingTasks,
      itemsInReview,
    };
  }

  async create(tenantId: string, data: any) {
    const sanitizedData = this.sanitizeProjectInput(data);
    return this.prisma.project.create({
      data: {
        ...sanitizedData,
        tenantId,
      },
    });
  }

  private sanitizeProjectInput(data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {
      name,
      standard,
      status,
      location,
      projectContact,
      description,
      companyId,
      startDate,
      endDate,
    }: {
      name: string;
      standard?: string;
      status?: any;
      location?: string;
      projectContact?: string;
      description?: string;
      companyId?: string;
      startDate?: string | Date;
      endDate?: string | Date;
    } = data;

    return {
      name,
      standard,
      status,
      location,
      projectContact,
      description,
      // Handle empty strings for optional fields
      companyId: companyId || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };
  }

  async findAll(tenantId: string) {
    return this.prisma.project.findMany({
      where: { tenantId },
      include: {
        company: {
          select: { name: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getRecentProjects(tenantId: string) {
    return this.prisma.project.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        standard: true,
        status: true,
        company: {
          select: { name: true },
        },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, tenantId },
      include: {
        company: true,
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            tasks: {
              orderBy: { createdAt: 'asc' },
              include: { 
                subtasks: {
                    orderBy: { createdAt: 'asc' }
                } 
              }
            },
          },
        },
        tasks: true, // Fetch all tasks for stats if needed
      },
    });

    if (!project) return null;

    // Calculate progress
    const totalTasks = await this.prisma.task.count({
      where: { projectId: id },
    });
    const completedTasks = await this.prisma.task.count({
      where: { projectId: id, status: 'COMPLETE' },
    });
    const progress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Get next task
    const nextTask = await this.prisma.task.findFirst({
      where: { projectId: id, status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: 1,
    });

    return {
      ...project,
      stats: {
        progress,
        totalTasks,
        completedTasks,
        nextTask,
      },
    };
  }
  async update(tenantId: string, id: string, data: any) {
    const project = await this.prisma.project.findFirst({
      where: { id, tenantId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const sanitizedData = this.sanitizeProjectInput(data);

    return this.prisma.project.update({
      where: { id },
      data: sanitizedData,
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.project.delete({
      where: { id, tenantId },
    });
  }

  // --- Module Management ---



// ... existing imports ...

  async createModule(
    tenantId: string,
    projectId: string,
    data: { name: string; description?: string },
  ) {
    // Verify project belongs to tenant
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });
    if (!project) throw new NotFoundException('Project not found');

    // Get max orderIndex
    const lastModule = await this.prisma.projectModule.findFirst({
      where: { projectId },
      orderBy: { orderIndex: 'desc' },
    });
    const orderIndex = lastModule ? lastModule.orderIndex + 1 : 0;

    // Create Module
    const newModule = await this.prisma.projectModule.create({
      data: {
        projectId,
        name: data.name,
        description: data.description,
        orderIndex,
      },
    });

    // Seed Template Tasks if available
    // Check if the module name matches a known template (key in PROJECT_TEMPLATES)
    // We try to match loosely or exactly. For now, exact match or case insensitive.
    // The user sends "Auditoría Energética" which matches the name in the detailed request.
    const templateKey = Object.keys(PROJECT_TEMPLATES).find(
      (k) => k.toLowerCase() === data.name.toLowerCase() || 
             PROJECT_TEMPLATES[k].name.toLowerCase() === data.name.toLowerCase()
    );

    if (templateKey) {
      const template = PROJECT_TEMPLATES[templateKey];
      
      for (const task of template.tasks) {
        const newTask = await this.prisma.task.create({
          data: {
            title: task.title,
            description: task.description,
            projectId,
            moduleId: newModule.id,
            status: 'PENDING',
            type: 'STANDARD',
          },
        });

        if (task.subtasks && task.subtasks.length > 0) {
            await this.prisma.subtask.createMany({
                data: task.subtasks.map(st => ({
                    taskId: newTask.id,
                    title: st.title,
                    description: st.description,
                    type: st.type
                }))
            });
        }
      }
    }

    return newModule;
  }

  async updateModule(
    tenantId: string,
    projectId: string,
    moduleId: string,
    data: { name?: string; description?: string },
  ) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });
    if (!project) throw new NotFoundException('Project not found');

    // Verify module belongs to project
    const module = await this.prisma.projectModule.findFirst({
      where: { id: moduleId, projectId },
    });
    if (!module) throw new NotFoundException('Module not found');

    return this.prisma.projectModule.update({
      where: { id: moduleId },
      data,
    });
  }

  async removeModule(tenantId: string, projectId: string, moduleId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const module = await this.prisma.projectModule.findFirst({
      where: { id: moduleId, projectId },
    });
    if (!module) throw new NotFoundException('Module not found');

    return this.prisma.projectModule.delete({
      where: { id: moduleId },
    });
  }

  async updateSubtask(tenantId: string, projectId: string, subtaskId: string, data: any) {
    const subtask = await this.prisma.subtask.findFirst({
      where: {
        id: subtaskId,
        task: {
          project: {
            tenantId,
            id: projectId,
          },
        },
      },
    });

    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }

    return this.prisma.subtask.update({
      where: { id: subtaskId },
      data,
    });
  }

  async createTask(
    tenantId: string,
    projectId: string,
    moduleId: string,
    data: { title: string; description?: string },
  ) {
    // Verify project and module
    const module = await this.prisma.projectModule.findFirst({
      where: { id: moduleId, projectId },
      include: { project: true },
    });

    if (!module)
      throw new NotFoundException(
        'Module not found or does not belong to the project',
      );
    if (module.project.tenantId !== tenantId)
      throw new NotFoundException('Project not found');

    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId,
        moduleId,
        status: 'PENDING',
        type: 'STANDARD',
      },
    });
  }
}
