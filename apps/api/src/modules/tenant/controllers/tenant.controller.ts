import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { TenantService } from '../services/tenant.service';
import { CreateTenantDto, UpdateTenantDto } from '../dto/tenant.dto';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @Permissions('tenant.create') // Likely SuperAdmin only
  async create(@Body() dto: CreateTenantDto) {
    return this.tenantService.create(dto);
  }

  @Get()
  @Permissions('tenant.read')
  async findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  @Permissions('tenant.read')
  async findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Patch(':id')
  @Permissions('tenant.update')
  async update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantService.update(id, dto);
  }

  @Post(':id/suspend')
  @Permissions('tenant.suspend')
  async suspend(@Param('id') id: string) {
    return this.tenantService.suspend(id);
  }

  @Post(':id/activate')
  @Permissions('tenant.activate')
  async activate(@Param('id') id: string) {
    return this.tenantService.activate(id);
  }
}
