import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
  description: 'Nombre de la empresa / Tenant',
  example: 'Eficenza S.A.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
  description: 'Correo del administrador inicial',
  example: 'admin@eficenza.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
  description: 'Contraseña del administrador (min 6 caracteres)',
  example: 'Secret123!',
  minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
  description: 'Nombre comercial de la empresa',
  example: 'Eficenza 360',
  })
  @IsString()
  @IsOptional()
  commercialName?: string;
}
