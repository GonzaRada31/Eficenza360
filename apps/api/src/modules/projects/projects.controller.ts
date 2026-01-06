/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
  getDashboardStats(@Request() req) {
    return this.projectsService.getDashboardStats(req.user.tenantId as string);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Obtener proyectos recientes' })
  getRecentProjects(@Request() req) {
    return this.projectsService.getRecentProjects(req.user.tenantId as string);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo proyecto' })
  create(@Request() req, @Body() body: any) {
    return this.projectsService.create(req.user.tenantId as string, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los proyectos' })
  findAll(@Request() req) {
    return this.projectsService.findAll(req.user.tenantId as string);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de un proyecto' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.projectsService.findOne(req.user.tenantId as string, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar proyecto' })
  update(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.projectsService.update(req.user.tenantId as string, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar proyecto' })
  remove(@Request() req, @Param('id') id: string) {
    return this.projectsService.remove(req.user.tenantId as string, id);
  }

  @Post(':id/modules')
  @ApiOperation({ summary: 'Agregar módulo al proyecto' })
  createModule(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { name: string; description?: string },
  ) {
    return this.projectsService.createModule(
      req.user.tenantId as string,
      id,
      body,
    );
  }

  @Patch(':id/modules/:moduleId')
  @ApiOperation({ summary: 'Actualizar módulo del proyecto' })
  updateModule(
    @Request() req,
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
    @Body() body: any,
  ) {
    return this.projectsService.updateModule(
      req.user.tenantId as string,
      id,
      moduleId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      body,
    );
  }

  @Delete(':id/modules/:moduleId')
  @ApiOperation({ summary: 'Eliminar módulo del proyecto' })
  removeModule(
    @Request() req,
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.projectsService.removeModule(
      req.user.tenantId as string,
      id,
      moduleId,
    );
  }
  @Post(':id/modules/:moduleId/tasks')
  @ApiOperation({ summary: 'Crear tarea en un módulo' })
  createTask(
    @Request() req,
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
    @Body() body: { title: string; description?: string },
  ) {
    return this.projectsService.createTask(
      req.user.tenantId as string,
      id,
      moduleId,
      body,
    );
  }
  @Patch(':id/subtasks/:subtaskId')
  @ApiOperation({ summary: 'Actualizar subtarea' })
  updateSubtask(
    @Request() req,
    @Param('id') id: string,
    @Param('subtaskId') subtaskId: string,
    @Body() body: any,
  ) {
    return this.projectsService.updateSubtask(
      req.user.tenantId as string,
      id,
      subtaskId,
      body,
    );
  }
}
