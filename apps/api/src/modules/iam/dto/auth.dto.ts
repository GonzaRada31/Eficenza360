import {
  IsEmail,
  IsString,
  MinLength,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  fullName: string;

  @IsUUID()
  @IsOptional()
  roleId?: string;
}
