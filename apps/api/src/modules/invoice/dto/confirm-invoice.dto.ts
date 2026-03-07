import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsObject,
} from 'class-validator';
import { ServiceType } from '@prisma/client';

export class ConfirmInvoiceDto {
  @ApiProperty({ description: 'URL of the invoice image in blob storage' })
  @IsString()
  imageUrl: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  vendorName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  vendorTaxId?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  consumption?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({
  enum: ServiceType,
  description: 'Service type (loose string allowed, normalized on backend)',
  })
  @IsString()
  @IsOptional() // Make it optional to allow default fallback
  serviceType: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  periodStart?: string; // Expecting ISO date string from frontend

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  periodEnd?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  pendingInvoiceId?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  rawData?: Record<string, unknown>;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  subtaskId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  clientNumber?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ required: false, default: 'ai' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  aiConfidence?: number;
}
