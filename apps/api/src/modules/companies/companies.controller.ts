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
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { Prisma } from '@prisma/client';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() body: Prisma.CompanyUncheckedCreateInput,
  ) {
    return this.companiesService.create(req.user.tenantId, body);
  }

  @Get()
  findAll(@Request() req: RequestWithUser) {
    return this.companiesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.companiesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: Prisma.CompanyUncheckedUpdateInput,
  ) {
    return this.companiesService.update(req.user.tenantId, id, body);
  }

  @Delete(':id')
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.companiesService.remove(req.user.tenantId, id);
  }
}
