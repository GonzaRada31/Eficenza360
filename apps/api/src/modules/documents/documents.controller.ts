import { Controller, Post, Get, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@UseInterceptors(LoggingInterceptor, ResponseInterceptor)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @ApiOperation({ summary: 'Generate an S3 Presigned URL for secure upload' })
  @ApiResponse({ status: 201, description: 'Presigned URL successfully generated' })
  @Post('presign')
  @Permissions('document.upload')
  async presign(@Body() dto: PresignUploadDto) {
    // Maps to backend internal Presign service 
    return this.documentsService.generatePresignedUrl({
      fileName: dto.fileName,
      contentType: dto.mimeType,
    });
  }

  @ApiOperation({ summary: 'Create a Document Metadata Record and Version 1' })
  @ApiResponse({ status: 201, description: 'Document Metadata stored successfully' })
  @Post()
  @Permissions('document.upload')
  async create(@Body() dto: CreateDocumentDto) {
    return this.documentsService.create(dto);
  }

  @ApiOperation({ summary: 'Retrieve Document details and a Presigned GET URL for viewing' })
  @ApiResponse({ status: 200, description: 'Document successfully retrieved' })
  @Get(':id')
  @Permissions('document.read')
  async findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }
}
