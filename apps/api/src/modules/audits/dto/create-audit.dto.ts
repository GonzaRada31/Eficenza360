import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SiteDto {
  @ApiProperty({ example: 'Building A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'New York, NY', required: false })
  @IsString()
  @IsNotEmpty()
  location: string;
}

export class CreateAuditDto {
  @ApiProperty({ example: 'Q3 Enterprise Energy Audit' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Focusing on HQ and Warehouse operations' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: [SiteDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SiteDto)
  sites: SiteDto[];
}
