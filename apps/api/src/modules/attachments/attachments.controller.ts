import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  BadRequestException,
  Request as Req,
  InternalServerErrorException,
  Get,
  Param,
  ForbiddenException,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

@ApiTags('Attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        subtaskId: {
          type: 'string',
        },
      },
      required: ['file', 'subtaskId'],
    },
  })
  @ApiOperation({
    summary: 'Subir adjunto genérico con aislamiento por tenant',
  })
  async uploadAttachment(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { subtaskId: string },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!body.subtaskId) {
      throw new BadRequestException('subtaskId is required');
    }

    try {
      const result = await this.attachmentsService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        req.user.tenantId,
        body.subtaskId,
      );

      return {
        ...result,
        uploadedBy: req.user.userId,
      };
    } catch (error) {
      console.error('[AttachmentsController] Upload failed:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error during upload',
      );
    }
  }

  @Get(':blobName/sas')
  @ApiOperation({ summary: 'Obtener URL SAS temporal para un archivo' })
  async getAttachmentSas(
    @Req() req: AuthenticatedRequest,
    @Param('blobName') blobName: string, // Be careful, blobName might contain slashes which needs strict handling in routing
  ) {
    // NOTE: Express might decode slashes in params.
    // A safer way often is to pass the full blob path as a query param or handle wildcards.
    // However, for Tenant isolation, we MUST validate the prefix.

    // If blobName comes in as "tenant-123/subtask-456/file.pdf", verify tenant-123 matches req.user.tenantId

    // Since blobName contains slashes, standard parameter routing might break.
    // Usually, it's better to pass it as query param ?blobName=... OR use a wildcard route.
    // Let's assume for now we use a query parameter approach or fix it to be robust.
    // But adhering to the interface defined:

    // IMPORTANT: In NestJS, defining route as ':blobName(*)' allows checking slashes.
    return this.handleSasRequest(req, blobName);
  }

  // Helper handling the logic
  private async handleSasRequest(req: AuthenticatedRequest, blobName: string) {
    const { tenantId } = req.user;
    if (!blobName.startsWith(`${tenantId}/`)) {
      throw new ForbiddenException(
        'Access denied: specific blob does not belong to your tenant',
      );
    }

    const sasUrl = await this.attachmentsService.generateSasUrl(
      blobName,
      tenantId,
    );
    return { sasUrl };
  }

  // Wildcard route to handle blob names with slashes
  @Get('sas/*')
  @ApiOperation({ summary: 'Obtener SAS handling paths with slashes' })
  async getSasWildcard(@Req() req: AuthenticatedRequest) {
    // construct blobName from path
    // req.path is like /attachments/sas/tenant/subtask/file.pdf
    // We need to extract everything after /sas/
    const match = req.url.match(/\/attachments\/sas\/(.*)(\?|$)/);
    if (!match || !match[1]) {
      throw new BadRequestException('Invalid blob path');
    }
    const blobName = decodeURIComponent(match[1]); // Ensure we decode just in case
    return this.handleSasRequest(req, blobName);
  }

  @Delete('*')
  @ApiOperation({ summary: 'Eliminar archivo adjunto (Wildcard)' })
  async deleteAttachment(@Req() req: AuthenticatedRequest) {
    // req.path is like /attachments/tenant/subtask/file.pdf (if we use * at root of controller, but controller is 'attachments')
    // Route is attachments/*
    // So match everything after /attachments/
    const match = req.url.match(/\/attachments\/(.*)(\?|$)/);
    if (!match || !match[1]) {
      // If it matched but empty?
      throw new BadRequestException('Invalid blob path for deletion');
    }

    const blobName = decodeURIComponent(match[1]);

    // Validation: verify tenant prefix
    const { tenantId } = req.user;
    if (!blobName.startsWith(`${tenantId}/`)) {
      throw new ForbiddenException(
        'Access denied: specific blob does not belong to your tenant',
      );
    }

    await this.attachmentsService.deleteFile(blobName, tenantId);
    return { success: true, message: 'File deleted' };
  }
}
