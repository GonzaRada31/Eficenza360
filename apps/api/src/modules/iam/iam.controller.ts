import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IamService } from './iam.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { LoginDto } from './dto/login.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
} from './dto/password-reset.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Identity & Access Management')
@Controller('iam')
export class IamController {
  constructor(private readonly iamService: IamService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'Registrar nueva empresa (Tenant) y usuario administrador',
  })
  @ApiResponse({ status: 201, description: 'Tenant creado exitosamente' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.iamService.createTenant(createTenantDto);
  }
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener JWT' })
  @ApiResponse({ status: 200, description: 'Acceso exitoso, retorna JWT' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  login(@Body() loginDto: LoginDto) {
    return this.iamService.login(loginDto);
  }

  @Post('invite')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invitar nuevo usuario (Solo Admin)' })
  @ApiResponse({ status: 201, description: 'Usuario invitado exitosamente' })
  @ApiResponse({ status: 409, description: 'Usuario ya existe' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  invite(@Body() inviteUserDto: InviteUserDto, @Request() req) {
    return this.iamService.inviteUser(inviteUserDto, req.user);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiResponse({
    status: 201,
    description: 'Si el correo existe, se enviará el token',
  })
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.iamService.requestPasswordReset(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña usando token' })
  @ApiResponse({
    status: 201,
    description: 'Contraseña actualizada exitosamente',
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.iamService.resetPassword(dto);
  }
}
