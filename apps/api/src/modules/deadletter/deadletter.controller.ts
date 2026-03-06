import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { DeadLetterService } from './deadletter.service';
import { Permissions } from '../../common/decorators/permissions.decorator';
// import { AuthGuard } from '../../common/guards/auth.guard'; // Assume applied globally or at module
// import { PermissionGuard } from '../../common/guards/permission.guard';

@Controller('admin/dead-jobs')
export class DeadLetterController {
  constructor(private readonly dlqService: DeadLetterService) {}

  @Get()
  @Permissions('admin.system')
  async listDeadJobs(@Query('limit') limit: number) {
    return this.dlqService.getDeadJobs(limit || 50);
  }

  @Post(':id/retry')
  @Permissions('admin.system')
  async retryJob(@Param('id') id: string) {
    return this.dlqService.retryJob(id);
  }
}
