import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAuditDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  @IsNotEmpty()
  companyId!: string;
}

export class UpdateAuditDto {
  @IsString()
  name?: string;
}
