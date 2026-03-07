import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class PresignDocumentDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;
}

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsNumber()
  size: number;

  @IsString()
  @IsNotEmpty()
  s3Key: string;

  @IsString()
  @IsOptional()
  category?: string;
}
