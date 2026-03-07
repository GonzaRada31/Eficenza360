import { IsString, IsNotEmpty, IsUUID, IsNumber } from 'class-validator';

export class CalculateCarbonDto {
  @IsUUID()
  @IsNotEmpty()
  auditId: string;
}
