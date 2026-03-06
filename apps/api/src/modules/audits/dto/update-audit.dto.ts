import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum AuditStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
}

export class UpdateAuditDto {
  @ApiPropertyOptional({ example: 'Revised Q3 Audit Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: AuditStatus })
  @IsEnum(AuditStatus)
  @IsOptional()
  status?: AuditStatus;
}
