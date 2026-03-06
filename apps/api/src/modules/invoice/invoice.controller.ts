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
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { AzureInvoiceService } from './azure-invoice.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Invoice } from '@prisma/client';
import { InvoiceService } from './invoice.service';

import { ConfirmInvoiceDto } from './dto/confirm-invoice.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoiceController {
  constructor(
    private readonly azureInvoiceService: AzureInvoiceService,
    private readonly invoiceService: InvoiceService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload-only')
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
      },
    },
  })
  @ApiOperation({ summary: 'Subir archivo a Blob Storage (sin análisis)' })
  async uploadFile(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { subtaskId?: string },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // 1. Upload to Blob Storage
      const sanitizedFilename = file.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        '_',
      );
      const filename = `${req.user.tenantId}/${Date.now()}-${sanitizedFilename}`;

      this.azureInvoiceService['logger'].log(`Uploading file ${filename}...`);

      const { blobName, sasUrl } = await this.azureInvoiceService.uploadToBlob(
        file.buffer,
        filename,
        file.mimetype,
        req.user.tenantId,
      );

      // 2. Create Pending Invoice Record
      const invoice = await this.invoiceService.createPendingInvoice(
        req.user.tenantId,
        {
          blobName,
          originalFilename: file.originalname,
          mimeType: file.mimetype,
          subtaskId: body.subtaskId,
        },
      );

      return {
        ...invoice,
        imageUrl: sasUrl, // Return SAS URL for immediate usage
      };
    } catch (error) {
      console.error('[InvoiceController] Upload failed:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error during upload',
      );
    }
  }

  @Post('analyze')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string' },
      },
      required: ['imageUrl'],
    },
  })
  @ApiOperation({ summary: 'Analizar factura previamente subida con Azure AI' })
  async analyzeInvoice(@Body() body: { imageUrl: string }) {
    if (!body.imageUrl) {
      throw new BadRequestException('imageUrl is required');
    }

    try {
      // 2. Analyze with Azure AI
      const analysisResult = await this.azureInvoiceService.analyzeInvoice(
        body.imageUrl,
      );

      return {
        extractedData: analysisResult,
      };
    } catch (error) {
      console.error('[InvoiceController] Analysis failed:', error);
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Unknown error during analysis',
      );
    }
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirmar y guardar datos de factura' })
  async confirmInvoice(
    @Req() req: AuthenticatedRequest,
    @Body() body: ConfirmInvoiceDto,
  ): Promise<Invoice> {
    const { tenantId } = req.user;
    return this.invoiceService.createInvoice(tenantId, body);
  }

  @Get('subtask/:subtaskId/summary')
  @ApiOperation({ summary: 'Obtener resumen de facturas por subtarea' })
  async getInvoiceSummary(
    @Req() req: AuthenticatedRequest,
    @Param('subtaskId') subtaskId: string,
  ) {
    const { tenantId } = req.user;
    return this.invoiceService.getSubtaskSummary(subtaskId, tenantId);
  }

  @Get('subtask/:subtaskId')
  @ApiOperation({ summary: 'Listar facturas por subtarea' })
  async getInvoices(
    @Req() req: AuthenticatedRequest,
    @Param('subtaskId') subtaskId: string,
  ) {
    const { tenantId } = req.user;
    return this.invoiceService.getInvoicesBySubtask(subtaskId, tenantId);
  }
}
