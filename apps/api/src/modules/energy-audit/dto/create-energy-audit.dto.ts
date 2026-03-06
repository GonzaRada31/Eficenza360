import { IsString, IsInt, Min, Max, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateEnergyAuditDto {
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1990)
  @Max(2100)
  year: number;
}
