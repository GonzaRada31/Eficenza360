import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsInt,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { EnergyRecordType } from '@prisma/client';

export class UpsertEnergyRecordItemDto {
  @IsOptional()
  @IsUUID()
  id?: string; // If provided, it's an update. If not, create.

  @IsEnum(EnergyRecordType)
  recordType: EnergyRecordType;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  consumptionValue: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsUUID()
  emissionFactorId?: string;

  @IsOptional()
  @IsString()
  evidenceUrl?: string;

  @IsOptional()
  @IsString()
  deduplicationKey?: string;

  @IsOptional()
  @IsInt()
  version?: number; // Mandatory for occ if id is provided
}
