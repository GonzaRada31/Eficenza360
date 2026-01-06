import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
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
    enum: UserRole,
    example: UserRole.COLLABORATOR,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Nombre completo del usuario (opcional)',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsOptional()
  fullName?: string;
}
