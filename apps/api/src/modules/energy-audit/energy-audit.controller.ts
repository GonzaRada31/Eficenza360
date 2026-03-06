import { Controller, Post, Body, Param, Put, UseGuards, Get, Request, DefaultValuePipe, ParseIntPipe, ParseUUIDPipe, Query } from '@nestjs/common';
import { EnergyAuditService } from './energy-audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateEnergyAuditDto } from './dto/create-energy-audit.dto';
import type { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { UpsertEnergyRecordItemDto } from './dto/upsert-energy-record.dto';
import { UpdateAuditStatusDto } from './dto/update-audit-status.dto';

@Controller('energy-audits')
@UseGuards(JwtAuthGuard)
export class EnergyAuditController {
  constructor(private readonly energyAuditService: EnergyAuditService) {}

  @Post()
  async createAudit(@Request() req: RequestWithUser, @Body() dto: CreateEnergyAuditDto) {
    return this.energyAuditService.createAudit(req.user.tenantId, dto);
  }

  @Get(':id')
  async getAuditById(
    @Request() req: RequestWithUser, 
    @Param('id', ParseUUIDPipe) id: string
  ) {
    // FIX PACK: This now returns only the Audit, safely isolated
    return this.energyAuditService.getAuditById(req.user.tenantId, id);
  }

  // FIX PACK: Paginating the large set of records structurally
  @Get(':id/records')
  async getAuditRecords(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.energyAuditService.getAuditRecords(req.user.tenantId, id, page, limit);
  }

  @Put(':id/status')
  async updateStatus(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAuditStatusDto
  ) {
    // DTO Already forbids VALIDATED status string literal directly 
    return this.energyAuditService.updateStatus(req.user.tenantId, id, dto.status);
  }

  // FIX PACK: Exclusive FSM Endpoint with snapshot generation mapping
  @Post(':id/validate')
  async validateAudit(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.energyAuditService.validateAudit(req.user.tenantId, id);
  }

  @Post(':id/records')
  async upsertRecord(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertEnergyRecordItemDto
  ) {
    return this.energyAuditService.upsertRecord(req.user.tenantId, id, dto);
  }
}
