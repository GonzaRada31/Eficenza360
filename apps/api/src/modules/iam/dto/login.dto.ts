import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
  description: 'Correo electrónico del usuario',
  example: 'admin@eficenza.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'Secret123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
