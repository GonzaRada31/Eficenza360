import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ example: 'Invoice 2026' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ example: 1048576 })
  @IsNumber()
  @Min(1)
  size: number;

  @ApiProperty({
    example: 'tenant-123/timestamp-invoice-2026.pdf',
    description: 'Internal S3 storage locator path',
  })
  @IsString()
  @IsNotEmpty()
  s3Key: string;

  @ApiPropertyOptional({ example: 'INVOICE' })
  @IsString()
  @IsOptional()
  category?: string;
}
