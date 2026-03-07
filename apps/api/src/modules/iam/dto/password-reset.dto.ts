import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordResetDto {
  @ApiProperty({
  description: 'Correo electrónico para recuperación',
  example: 'usuario@eficenza.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de recuperación recibido por email' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
  description: 'Nueva contraseña (min 6 caracteres)',
  example: 'NuevaPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
