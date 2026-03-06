import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectModulesService } from './project-modules.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import type { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { Prisma } from '@prisma/client';

@ApiTags('Project Modules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/modules')
export class ProjectModulesController {
  constructor(private readonly projectModulesService: ProjectModulesService) {}

  @Post()
  create(
    @Request() req: RequestWithUser,
    @Param('projectId') projectId: string,
    @Body() body: Prisma.ProjectModuleUncheckedCreateInput,
  ) {
    return this.projectModulesService.create(
      req.user.tenantId,
      projectId,
      body,
    );
  }

  @Get()
  findAll(
    @Request() req: RequestWithUser,
    @Param('projectId') projectId: string,
  ) {
    return this.projectModulesService.findAll(req.user.tenantId, projectId);
  }

  @Patch(':id')
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: Prisma.ProjectModuleUncheckedUpdateInput,
  ) {
    return this.projectModulesService.update(req.user.tenantId, id, body);
  }

  @Delete(':id')
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.projectModulesService.remove(req.user.tenantId, id);
  }
}
