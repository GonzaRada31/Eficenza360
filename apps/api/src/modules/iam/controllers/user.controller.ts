import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/auth.dto';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { getTenantId } from '../../../infra/context/tenant.context';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Permissions('user.create')
  async create(@Body() dto: CreateUserDto) {
    const tenantId = getTenantId();
    if (!tenantId) throw new Error('Tenant context missing');
    return this.userService.create(dto, tenantId);
  }

  @Get()
  @Permissions('user.read')
  async findAll() {
    return this.userService.findAll();
  }
}
