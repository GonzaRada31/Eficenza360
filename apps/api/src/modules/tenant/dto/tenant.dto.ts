import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  commercialName?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  commercialName?: string;
}
