import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Prisma, Project, Task, Subtask, ProjectModule } from '@prisma/client';
import type { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Obtener estadísticas para el dashboard principal' })
  getDashboardStats(@Request() req: RequestWithUser): Promise<{
    activeProjects: number;
    completedProjects: number;
    pendingTasks: number;
    itemsInReview: number;
  }> {
    return this.projectsService.getDashboardStats(req.user.tenantId);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Obtener proyectos recientes' })
  getRecentProjects(
    @Request() req: RequestWithUser,
  ): Promise<Partial<Project>[]> {
    return this.projectsService.getRecentProjects(req.user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo proyecto' })
  create(
    @Request() req: RequestWithUser,
    @Body() body: Prisma.ProjectUncheckedCreateInput,
  ): Promise<Project> {
    return this.projectsService.create(req.user.tenantId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los proyectos' })
  findAll(@Request() req: RequestWithUser): Promise<Project[]> {
    return this.projectsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de un proyecto' })
  findOne(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<Project> {
    return this.projectsService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar proyecto' })
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: Prisma.ProjectUncheckedUpdateInput,
  ): Promise<Project> {
    return this.projectsService.update(req.user.tenantId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar proyecto' })
  remove(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<Project> {
    return this.projectsService.remove(req.user.tenantId, id);
  }

  @Post(':id/modules')
  @ApiOperation({ summary: 'Agregar módulo al proyecto' })
  createModule(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: { name: string; description?: string },
  ): Promise<ProjectModule> {
    return this.projectsService.createModule(req.user.tenantId, id, body);
  }

  @Patch(':id/modules/:moduleId')
  @ApiOperation({ summary: 'Actualizar módulo del proyecto' })
  updateModule(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
    @Body() body: Prisma.ProjectModuleUncheckedUpdateInput,
  ): Promise<ProjectModule> {
    return this.projectsService.updateModule(
      req.user.tenantId,
      id,
      moduleId,
      body,
    );
  }

  @Delete(':id/modules/:moduleId')
  @ApiOperation({ summary: 'Eliminar módulo del proyecto' })
  removeModule(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
  ): Promise<ProjectModule> {
    return this.projectsService.removeModule(req.user.tenantId, id, moduleId);
  }
  @Post(':id/modules/:moduleId/tasks')
  @ApiOperation({ summary: 'Crear tarea en un módulo' })
  createTask(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
    @Body()
    body: {
      title: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      deduplicationKey?: string;
    },
  ): Promise<Task> {
    return this.projectsService.createTask(
      req.user.tenantId,
      id,
      moduleId,
      body,
    );
  }

  @Patch(':id/tasks/:taskId')
  @ApiOperation({ summary: 'Actualizar tarea (fechas, estado, etc)' })
  updateTask(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() body: Prisma.TaskUncheckedUpdateInput,
  ): Promise<Task> {
    return this.projectsService.updateTask(req.user.tenantId, id, taskId, body);
  }
  @Delete(':id/tasks/:taskId')
  @ApiOperation({ summary: 'Eliminar tarea (Soft Delete)' })
  removeTask(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Param('taskId') taskId: string,
  ): Promise<Task> {
    return this.projectsService.removeTask(req.user.tenantId, id, taskId);
  }

  @Post(':id/subtasks')
  @ApiOperation({ summary: 'Crear subtarea (puede ser anidada)' })
  createSubtask(
    @Request() req: RequestWithUser,
    @Param('id') projectId: string,
    @Body()
    body: {
      taskId: string;
      description: string;
      title?: string;
      startDate?: string;
      endDate?: string;
      parentSubtaskId?: string;
      deduplicationKey?: string;
    },
  ): Promise<Subtask> {
    const { taskId, ...data } = body;
    return this.projectsService.createSubtask(
      req.user.tenantId,
      projectId,
      taskId,
      data,
    );
  }

  @Patch(':id/subtasks/:subtaskId')
  @ApiOperation({ summary: 'Actualizar subtarea' })
  updateSubtask(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Param('subtaskId') subtaskId: string,
    @Body() body: Prisma.SubtaskUncheckedUpdateInput,
  ): Promise<Subtask> {
    return this.projectsService.updateSubtask(
      req.user.tenantId,
      id,
      subtaskId,
      body,
    );
  }

  @Delete(':id/subtasks/:subtaskId')
  @ApiOperation({ summary: 'Eliminar subtarea (Soft Delete)' })
  removeSubtask(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Param('subtaskId') subtaskId: string,
  ): Promise<Subtask> {
    return this.projectsService.removeSubtask(req.user.tenantId, id, subtaskId);
  }
}
