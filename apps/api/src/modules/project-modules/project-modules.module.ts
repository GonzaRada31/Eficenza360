import { Module } from '@nestjs/common';
import { ProjectModulesService } from './project-modules.service';
import { ProjectModulesController } from './project-modules.controller';

@Module({
  controllers: [ProjectModulesController],
  providers: [ProjectModulesService],
  exports: [ProjectModulesService],
})
export class ProjectModulesModule {}
