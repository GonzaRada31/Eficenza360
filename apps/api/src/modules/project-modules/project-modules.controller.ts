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

@ApiTags('Project Modules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/modules')
export class ProjectModulesController {
  constructor(private readonly projectModulesService: ProjectModulesService) {}

  @Post()
  create(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() body: any,
  ) {
    return this.projectModulesService.create(
      req.user.tenantId,
      projectId,
      body,
    );
  }

  @Get()
  findAll(@Request() req, @Param('projectId') projectId: string) {
    return this.projectModulesService.findAll(req.user.tenantId, projectId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.projectModulesService.update(req.user.tenantId, id, body);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.projectModulesService.remove(req.user.tenantId, id);
  }
}
