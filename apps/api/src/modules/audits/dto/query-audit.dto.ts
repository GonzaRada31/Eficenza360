import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { AuditStatus } from './update-audit.dto';

export class QueryAuditDto extends PaginationDto {
  @ApiPropertyOptional({ enum: AuditStatus })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
