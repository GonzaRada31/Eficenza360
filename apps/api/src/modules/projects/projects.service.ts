import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PROJECT_TEMPLATES, SubtaskTemplate } from './project-templates';
import {
  ProjectStatus,
  Task,
  Subtask,
  Project,
  ProjectModule,
  Prisma,
} from '@prisma/client';

// Local type for sanitization
// Local type for sanitization (aligned with Prisma inputs)
type ProjectInput = Omit<
  Prisma.ProjectUncheckedCreateInput,
  'tenantId' | 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

type ProjectWithStats = Project & {
  stats: {
    progress: number;
    totalTasks: number;
    completedTasks: number;
    nextTask: Task | null;
  };
};

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(tenantId: string) {
    const activeProjects = await this.prisma.project.count({
      where: { tenantId, status: ProjectStatus.IN_PROGRESS, deletedAt: null },
    });

    const completedProjects = await this.prisma.project.count({
      where: { tenantId, status: ProjectStatus.COMPLETE, deletedAt: null },
    });

    // "Hallazgos Pendientes" could be mapped to Tasks/Subtasks that are pending
    const pendingTasks = await this.prisma.task.count({
      where: {
        project: {
          tenantId,
          deletedAt: null,
        },
        status: ProjectStatus.PENDING,
        deletedAt: null,
      },
    });

    // "Items en Revisión" could be another status or specific task type
    const itemsInReview = await this.prisma.task.count({
      where: {
        project: { tenantId, deletedAt: null },
        // Assuming 'PENDING' for now, or could add a REVIEW status later
        status: ProjectStatus.IN_PROGRESS,
        deletedAt: null,
      },
    });

    return {
      activeProjects,
      completedProjects,
      pendingTasks,
      itemsInReview,
    };
  }

  async create(
    tenantId: string,
    data: Prisma.ProjectUncheckedCreateInput,
  ): Promise<Project> {
    const sanitizedData = this.sanitizeProjectInput(data);
    return this.prisma.project.create({
      data: {
        ...sanitizedData,
        tenantId,
      },
    });
  }

  sanitizeProjectInput(
    data:
      | Prisma.ProjectUncheckedCreateInput
      | Prisma.ProjectUncheckedUpdateInput,
  ): ProjectInput {
    // Explicitly pick fields to Ensure type safety and undefined handling
    const sanitized: Partial<ProjectInput> = {};

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
    } = data;

    if (name !== undefined) {
      sanitized.name = name as ProjectInput['name'];
    }
    if (standard !== undefined) {
      sanitized.standard = standard as ProjectInput['standard'];
    }
    if (status !== undefined) {
      sanitized.status = status as ProjectInput['status'];
    }
    if (location !== undefined) {
      sanitized.location = location as ProjectInput['location'];
    }
    if (projectContact !== undefined) {
      sanitized.projectContact =
        projectContact as ProjectInput['projectContact'];
    }
    if (description !== undefined) {
      sanitized.description = description as ProjectInput['description'];
    }
    if (companyId !== undefined) {
      sanitized.companyId = companyId as ProjectInput['companyId'];
    }

    if (startDate !== undefined) {
      if (startDate === '' || startDate === null) {
        sanitized.startDate = null;
      } else if (typeof startDate === 'string' || startDate instanceof Date) {
        sanitized.startDate = new Date(startDate);
      }
    }

    if (endDate !== undefined) {
      if (endDate === '' || endDate === null) {
        sanitized.endDate = null;
      } else if (typeof endDate === 'string' || endDate instanceof Date) {
        sanitized.endDate = new Date(endDate);
      }
    }

    return sanitized as ProjectInput;
  }

  async findAll(tenantId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      include: {
        modules: {
          where: { deletedAt: null },
          include: {
            tasks: {
              where: { deletedAt: null },
              include: {
                subtasks: {
                  where: { deletedAt: null },
                  // // @ts-ignore
                  orderBy: { createdAt: 'asc' }, // Order subtasks if needed
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        company: {
          select: { name: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getRecentProjects(tenantId: string): Promise<Partial<Project>[]> {
    return this.prisma.project.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
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

  async findOne(tenantId: string, id: string): Promise<ProjectWithStats> {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      include: {
        modules: {
          where: {
            deletedAt: null,
          },
          orderBy: { orderIndex: 'asc' },
          include: {
            tasks: {
              where: {
                deletedAt: null,
              },
              // Task does not have orderIndex, sort by createdAt
              orderBy: { createdAt: 'asc' },
              include: {
                subtasks: {
                  where: {
                    deletedAt: null,
                  },
                  // Subtask does not have orderIndex, sort by createdAt
                  orderBy: { createdAt: 'asc' },
                },
              },
            },
          },
        },
        company: true,
        tasks: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project #${id} not found`);
    }

    // Calculate progress
    const totalTasks = await this.prisma.task.count({
      where: {
        projectId: id,
        // // @ts-ignore
        deletedAt: null,
      },
    });
    const completedTasks = await this.prisma.task.count({
      where: {
        projectId: id,
        status: ProjectStatus.COMPLETE,
        // // @ts-ignore
        deletedAt: null,
      },
    });
    const progress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Get next task
    const nextTask = await this.prisma.task.findFirst({
      where: {
        projectId: id,
        status: ProjectStatus.PENDING,
        deletedAt: null,
      },
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
  async update(
    tenantId: string,
    id: string,
    data: Prisma.ProjectUncheckedUpdateInput,
  ): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const sanitizedData = this.sanitizeProjectInput(data);

    try {
      return await this.prisma.project.update({
        where: {
          id,
          // tenantIdInWhere: tenantId // Prisma update where needs unique. ID is unique.
          // specific tenant check is better done via findFirst or explicitly if ID is globally unique.
          // But to be safe in multi-tenant:
          // We can't put tenantId in `where` if using `update` unless `@@unique([id, tenantId])` exists.
          // Standard pattern: verify existence first OR assume ID is UUID and just update.
          // Let's verify existence to enforce tenant isolation unless we trust ID entropy.
          // BETTER: strict tenant check.
        },
        data: sanitizedData,
      });
    } catch {
      // If record doesn't exist or tenant mismatch (if we added filter), handle it.
      // Since we just use ID, we might update someone else's project if ID collision (impossible) or if user guessed ID.
      // To strictly enforce tenant:
      const exists = await this.prisma.project.findFirst({
        where: {
          id,
          tenantId,
          deletedAt: null,
        },
      });
      if (!exists) throw new NotFoundException('Project not found');

      return this.prisma.project.update({
        where: { id },
        data: sanitizedData,
      });
    }
  }

  async remove(tenantId: string, id: string): Promise<Project> {
    const exists = await this.prisma.project.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
    });
    if (!exists) throw new NotFoundException('Project not found');

    // Soft delete
    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // --- Module Management ---

  // ... existing imports ...

  async createModule(
    tenantId: string,
    projectId: string,
    data: { name: string; description?: string; deduplicationKey?: string },
  ): Promise<ProjectModule> {
    // Verify project belongs to tenant
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId,
        deletedAt: null,
      },
    });
    if (!project) throw new NotFoundException('Project not found');

    // IDEMPOTENCY CHECK
    // If deduplicationKey is provided, check strict uniqueness.
    let existingModule: ProjectModule | null = null;
    if (data.deduplicationKey) {
      existingModule = await this.prisma.projectModule.findFirst({
        where: {
          tenantId,
          projectId,
          deduplicationKey: data.deduplicationKey,
          // deletedAt: null, // REMOVE THIS to find soft-deleted ones too
        },
      });
    } else {
      existingModule = await this.prisma.projectModule.findFirst({
        where: {
          tenantId,
          projectId,
          name: data.name,
          deletedAt: null, // For name check, we might keep it restricted to avoid reviving by name collision?
          // Actually safer to allow reviving if name matches exactly?
          // But dedupKey is the strong one. Let's keep name check strictly active-only for now
          // or just basic check.
        },
      });
    }

    if (existingModule) {
      // If it's soft-deleted, restore it!
      if (existingModule.deletedAt) {
        return this.prisma.projectModule.update({
          where: { id: existingModule.id },
          data: { deletedAt: null },
        });
      }
      return existingModule;
    }

    // Get max orderIndex
    const lastModule = await this.prisma.projectModule.findFirst({
      where: { projectId, deletedAt: null },
      orderBy: { orderIndex: 'desc' },
    });
    const orderIndex = lastModule ? lastModule.orderIndex + 1 : 0;

    // Create Module
    const newModule = await this.prisma.projectModule.create({
      data: {
        tenantId,
        projectId,
        name: data.name,
        description: data.description,
        deduplicationKey: data.deduplicationKey,
        orderIndex,
      },
    });

    // Seed Template Tasks if available
    const templateKey = Object.keys(PROJECT_TEMPLATES).find(
      (k) =>
        k.toLowerCase() === data.name.toLowerCase() ||
        PROJECT_TEMPLATES[k].name.toLowerCase() === data.name.toLowerCase(),
    );

    // Pre-fetch existing subtasks for idempotency in recursion
    const existingSubtasks = await this.prisma.subtask.findMany({
      where: {
        task: { projectId },
        deduplicationKey: { not: null },
        deletedAt: null,
      },
      select: {
        id: true,
        deduplicationKey: true,
        taskId: true,
      },
    });

    const existingSubtasksMap = new Map<
      string,
      { id: string; taskId: string }
    >();
    existingSubtasks.forEach((st) => {
      if (st.deduplicationKey) {
        existingSubtasksMap.set(st.deduplicationKey, {
          id: st.id,
          taskId: st.taskId,
        });
      }
    });

    if (templateKey) {
      const template = PROJECT_TEMPLATES[templateKey];

      if (template && template.tasks) {
        for (const task of template.tasks) {
          // IDEMPOTENCY KEY FOR TASK
          // Use provided key or fallback to title slug if missing (shouldn't happen with new templates)
          const taskDedupKey =
            task.deduplicationKey ||
            task.title.toUpperCase().replace(/\s+/g, '_');

          let existingTask = await this.prisma.task.findFirst({
            where: {
              tenantId,
              projectId,
              deduplicationKey: taskDedupKey,
              deletedAt: null,
            },
          });

          if (!existingTask) {
            existingTask = await this.prisma.task.create({
              data: {
                tenantId,
                title: task.title,
                description: task.description,
                projectId,
                moduleId: newModule.id,
                status: ProjectStatus.PENDING,
                type: 'STANDARD',
                deduplicationKey: taskDedupKey,
              },
            });
          } else {
            // Fix: If task exists but belongs to a different (deleted/old) module, reclaim it.
            if (existingTask.moduleId !== newModule.id) {
              existingTask = await this.prisma.task.update({
                where: { id: existingTask.id },
                data: { moduleId: newModule.id },
              });
            }
          }

          if (task.subtasks && task.subtasks.length > 0) {
            await this.createRecursiveSubtasks(
              tenantId,
              projectId,
              existingTask.id,
              task.subtasks,
              existingSubtasksMap,
            );
          }
        }
      }
    }

    return newModule;
  }

  async updateModule(
    tenantId: string,
    projectId: string,
    moduleId: string,
    data: Prisma.ProjectModuleUncheckedUpdateInput,
  ): Promise<ProjectModule> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId,
        deletedAt: null,
      },
    });
    if (!project) throw new NotFoundException('Project not found');

    // Verify module belongs to project
    const module = await this.prisma.projectModule.findFirst({
      where: {
        id: moduleId,
        projectId,
        deletedAt: null,
      },
    });
    if (!module) throw new NotFoundException('Module not found');

    return this.prisma.projectModule.update({
      where: { id: moduleId },
      data,
    });
  }

  async removeModule(
    tenantId: string,
    projectId: string,
    moduleId: string,
  ): Promise<ProjectModule> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId,
        deletedAt: null,
      },
    });
    if (!project) throw new NotFoundException('Project not found');

    const module = await this.prisma.projectModule.findFirst({
      where: {
        id: moduleId,
        projectId,
        deletedAt: null,
      },
    });
    if (!module) throw new NotFoundException('Module not found');

    // Soft delete module and all its tasks/subtasks cascade logic is tricky with soft delete.
    // Ideally we just mark the module as deleted.
    // If business logic requires, we can mark children too, but let's stick to module first.
    // User requested "Avitar hard delete en cascada".
    return this.prisma.projectModule.update({
      where: { id: moduleId },
      data: { deletedAt: new Date() },
    });
  }

  async updateSubtask(
    tenantId: string,
    projectId: string,
    subtaskId: string,
    data: Prisma.SubtaskUpdateInput,
  ): Promise<Subtask> {
    // 1. Verify ownership and existence
    // We don't strictly need projectId for finding subtask by ID, but it helps VALIDATE it belongs to that project context
    // Ideally we join task -> project
    const existing = await this.prisma.subtask.findFirst({
      where: {
        id: subtaskId,
        // // @ts-ignore
        tenantId,
        deletedAt: null,
        task: {
          projectId, // Ensure it belongs to this project
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Subtask ${subtaskId} not found`);
    }

    return this.prisma.subtask.update({
      where: { id: subtaskId },
      data,
    });
  }

  async removeSubtask(
    tenantId: string,
    projectId: string,
    subtaskId: string,
  ): Promise<Subtask> {
    const existing = await this.prisma.subtask.findFirst({
      where: {
        id: subtaskId,
        tenantId,
        deletedAt: null,
        task: {
          projectId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Subtask ${subtaskId} not found`);
    }

    // Soft delete subtask and its children (recursive)
    // For now, simpler ONE-LEVEL check or just update `deletedAt` for this ID.
    // If strict hierarchy, we should recurse. But `deletedAt` on parent implicitly hides children in UI usually.
    // However, for data consistency, let's mark children too.
    // Finding all children recursively is expensive.
    // A better approach for MVP soft delete is just deleting the node.
    // Use transaction to delete children if possible, but for recursive structures it's hard in one go without raw query.
    // Let's just soft delete the target subtask.
    return this.prisma.subtask.update({
      where: { id: subtaskId },
      data: { deletedAt: new Date() },
    });
  }

  async createTask(
    tenantId: string,
    projectId: string,
    moduleId: string,
    data: {
      title: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      deduplicationKey?: string;
    },
  ): Promise<Task> {
    // Verify project and module
    const module = await this.prisma.projectModule.findFirst({
      where: {
        id: moduleId,
        projectId,
        deletedAt: null,
      },
      include: { project: true },
    });

    if (!module)
      throw new NotFoundException(
        'Module not found or does not belong to the project',
      );
    if (module.project.tenantId !== tenantId)
      throw new NotFoundException('Project not found');

    // Idempotency check
    if (data.deduplicationKey) {
      const existing = await this.prisma.task.findFirst({
        where: {
          tenantId,
          projectId,
          deduplicationKey: data.deduplicationKey,
          deletedAt: null,
        },
      });
      if (existing) return existing;
    }

    return this.prisma.task.create({
      data: {
        tenantId,
        title: data.title,
        description: data.description,
        projectId,
        moduleId,
        status: ProjectStatus.PENDING,
        type: 'STANDARD',
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        deduplicationKey: data.deduplicationKey,
      },
    });
  }

  async updateTask(
    tenantId: string,
    projectId: string,
    taskId: string,
    data: Prisma.TaskUpdateInput,
  ): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
        project: {
          tenantId,
        },
        deletedAt: null,
      },
    });

    if (!task) throw new NotFoundException('Task not found');

    const { startDate, endDate, ...rest } = data;

    const updateData: Prisma.TaskUpdateInput = {
      ...(rest as Record<string, any>),
    };

    if (
      startDate &&
      (typeof startDate === 'string' || startDate instanceof Date)
    ) {
      updateData.startDate = new Date(startDate);
    }
    if (endDate && (typeof endDate === 'string' || endDate instanceof Date)) {
      updateData.endDate = new Date(endDate);
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });
  }

  async removeTask(
    tenantId: string,
    projectId: string,
    taskId: string,
  ): Promise<Task> {
    const existing = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Task ${taskId} not found or deleted`);
    }

    // Soft delete task and its subtasks
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.subtask.updateMany({
        where: { taskId },
        data: { deletedAt: new Date() },
      });

      return tx.task.update({
        where: { id: taskId },
        data: { deletedAt: new Date() },
      });
    });
  }

  async createSubtask(
    tenantId: string,
    projectId: string,
    taskId: string,
    data: {
      description: string;
      title?: string;
      startDate?: string;
      endDate?: string;
      parentSubtaskId?: string;
      deduplicationKey?: string;
    },
  ): Promise<Subtask> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          tenantId,
        },
        deletedAt: null,
      },
    });
    if (!task) throw new NotFoundException('Task not found');

    // Idempotency
    if (data.deduplicationKey) {
      const existing = await this.prisma.subtask.findFirst({
        where: {
          tenantId,
          taskId,
          parentSubtaskId: data.parentSubtaskId || null,
          deduplicationKey: data.deduplicationKey,
          deletedAt: null,
        },
      });
      if (existing) return existing;
    }

    return this.prisma.subtask.create({
      data: {
        tenantId,
        taskId,
        description: data.description,
        title: data.title,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        parentSubtaskId: data.parentSubtaskId,
        deduplicationKey: data.deduplicationKey,
      },
    });
  }

  private async createRecursiveSubtasks(
    tenantId: string,
    projectId: string,
    taskId: string,
    subtasks: SubtaskTemplate[],
    existingSubtasksMap: Map<string, { id: string; taskId: string }>,
    parentSubtaskId?: string,
  ): Promise<void> {
    for (const st of subtasks) {
      // 1. Check if this subtask already exists by deduplicationKey
      let currentSubtaskId: string | null = null;

      // We rely on the map which is pre-fetched and might be global for the project.
      // However, for strict hierarchy idempotency, we should ideally check parent relationship too.
      // The map approach is good for performance but let's double check if we can query.
      // Given the recursive nature, we trust the key if provided.

      if (st.deduplicationKey) {
        // Check DB directly to be safe about hierarchy if not in map (or map is loosely keyed)
        // Actually, let's try to query strict:
        const existing = await this.prisma.subtask.findFirst({
          where: {
            tenantId,
            taskId,
            parentSubtaskId: parentSubtaskId || null,
            deduplicationKey: st.deduplicationKey,
            deletedAt: null,
          },
          select: { id: true },
        });

        if (existing) {
          currentSubtaskId = existing.id;
        }
      }

      if (!currentSubtaskId) {
        // NOT FOUND: Create new subtask
        const newSubtask = await this.prisma.subtask.create({
          data: {
            tenantId,
            taskId,
            title: st.title,
            description: st.description,
            type: st.type || 'GENERAL',
            parentSubtaskId,
            inputType: st.expectedInputType || 'TEXT',

            // Efficiency & Context fields
            outputContext: st.outputContext || [],
            inputContext: st.inputContext || [],
            standard: st.standard,
            isActive: st.isActive ?? true,
            deduplicationKey: st.deduplicationKey,
            workspaceMode: st.workspaceMode || 'STANDARD',
            data: (st.data as Prisma.InputJsonValue) || {},
          },
        });
        currentSubtaskId = newSubtask.id;
      }

      // 2. ALWAYS process children (recurse), passing the current ID (whether new or reused)
      if (st.subtasks && st.subtasks.length > 0 && currentSubtaskId) {
        await this.createRecursiveSubtasks(
          tenantId,
          projectId,
          taskId,
          st.subtasks,
          existingSubtasksMap,
          currentSubtaskId,
        );
      }
    }
  }
}
