import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SystemRole {
  ADMIN = 'ADMIN',
  COLLABORATOR = 'COLLABORATOR',
  CLIENT = 'CLIENT',
}

export class InviteUserDto {
  @ApiProperty({
  description: 'Correo electrónico a invitar',
  example: 'colaborador@eficenza.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
  description: 'Rol asignado al nuevo usuario',
  enum: SystemRole,
  example: SystemRole.COLLABORATOR,
  })
  @IsEnum(SystemRole)
  @IsNotEmpty()
  role: SystemRole;

  @ApiPropertyOptional({
  description: 'Nombre completo del usuario (opcional)',
  example: 'Juan Pérez',
  })
  @IsString()
  @IsOptional()
  fullName?: string;
}
