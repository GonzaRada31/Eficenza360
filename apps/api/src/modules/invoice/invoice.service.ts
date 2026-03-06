import {
  InternalServerErrorException,
  HttpException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CarbonCalculationService } from '../carbon-footprint/carbon-calculation.service';
import {
  InvoiceStatus,
  ProcessingStatus,
  Prisma,
  DataStatus,
  Invoice,
  ServiceType,
  Subtask,
} from '@prisma/client';
import { ConfirmInvoiceDto } from './dto/confirm-invoice.dto';
import { AzureInvoiceService } from './azure-invoice.service';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly carbonService: CarbonCalculationService,
    private readonly azureInvoiceService: AzureInvoiceService,
  ) {}

  async validateSubtaskOwnership(
    subtaskId: string,
    tenantId: string,
  ): Promise<Subtask> {
    const subtask = await this.prisma.subtask.findFirst({
      where: {
        id: subtaskId,
        deletedAt: null,
        task: {
          deletedAt: null,
          project: {
            tenantId: tenantId,
            deletedAt: null,
          },
        },
      },
      include: {
        task: { include: { project: true } },
      },
    });

    if (!subtask) {
      throw new ForbiddenException(
        'Subtask validation failed: Resource not found or access denied',
      );
    }
    return subtask;
  }

  private mapServiceType(input?: string): ServiceType {
    if (!input) return ServiceType.ELECTRICITY;
    const normalized = String(input).toUpperCase().trim();

    // Explicit matches for detailed types
    if (
      normalized === 'GAS_NATURAL' ||
      normalized === 'GAS NATURAL' ||
      normalized === 'NATURAL_GAS'
    ) {
      return ServiceType.GAS_NATURAL;
    }
    if (normalized === 'GAS') {
      // Requirement: Map generic 'GAS' to 'GAS_NATURAL' explicitely
      return ServiceType.GAS_NATURAL;
    }
    if (normalized === 'DIESEL' || normalized === 'GASOIL') {
      return ServiceType.DIESEL;
    }
    if (
      normalized === 'GASOLINE' ||
      normalized === 'NAFTA' ||
      normalized === 'PETROL'
    ) {
      return ServiceType.GASOLINE;
    }
    if (normalized === 'LPG' || normalized === 'GLP') {
      return ServiceType.LPG;
    }

    // Other known types
    if (normalized === 'WATER' || normalized === 'AGUA') {
      return ServiceType.WATER;
    }

    // Explicit ELECTRICITY checks (preserved and prioritized for safety)
    if (
      normalized === 'ELECTRICITY' ||
      normalized === 'ELECTRICIDAD' ||
      normalized === 'LUZ' ||
      normalized.includes('ELEC')
    ) {
      return ServiceType.ELECTRICITY;
    }

    // Fallback for "Fuel" if not specified (Legacy/Generic) -> defaults to FUEL but could be flagged
    if (normalized === 'FUEL' || normalized === 'COMBUSTIBLE') {
      return ServiceType.FUEL;
    }

    if (normalized === 'OTHER' || normalized === 'OTRO') {
      return ServiceType.OTHER;
    }

    // Default fallback
    return ServiceType.ELECTRICITY;
  }

  async createInvoice(tenantId: string, dto: ConfirmInvoiceDto) {
    console.log('[InvoiceService] createInvoice called', { tenantId, dto });
    try {
      // 1. Validate Subtask Ownership and Configuration
      let subtaskConfig: Record<string, any> | undefined;
      if (dto.subtaskId) {
        const subtask = await this.validateSubtaskOwnership(
          dto.subtaskId,
          tenantId,
        );
        subtaskConfig = subtask.data as Record<string, any> | undefined;

        // Strict Service Type Validation
        if (
          subtaskConfig?.allowedServiceTypes &&
          Array.isArray(subtaskConfig.allowedServiceTypes)
        ) {
          const allowed = subtaskConfig.allowedServiceTypes as string[];
          const requestedType = this.mapServiceType(dto.serviceType);

          if (!allowed.includes(requestedType)) {
            throw new BadRequestException(
              `Service type '${requestedType}' is not allowed for this task. Allowed types: ${allowed.join(
                ', ',
              )}`,
            );
          }
        }
      }

      // ... (rest of logic unchanged until catch)

      let invoice: Invoice;

      const safeDate = (dateStr?: string) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
      };

      // Validate imageUrl existence to prevent runtime errors
      if (!dto.imageUrl) {
        throw new InternalServerErrorException(
          'Image URL is required for invoice creation',
        );
      }

      // Check if it's a full URL (likely SAS) or just a blob name
      // We only want to save the blob name in the DB for cleaner storage and to allow generating fresh SAS URLs later
      const isFullUrl = dto.imageUrl.startsWith('http');
      const imageUrlToSave = isFullUrl ? undefined : dto.imageUrl;

      const parseNumber = (val: string | number | undefined | null) => {
        if (val === undefined || val === null) return null;
        if (typeof val === 'number' && !isNaN(val)) return val;
        const n = Number(String(val).replace(',', '.'));
        return isNaN(n) ? null : n;
      };

      const data: Prisma.InvoiceCreateInput | Prisma.InvoiceUpdateInput = {
        tenant: { connect: { id: tenantId } },
        // Only update subtask if provided and valid ID
        ...(dto.subtaskId && dto.subtaskId.trim() !== ''
          ? { subtask: { connect: { id: dto.subtaskId } } }
          : {}),

        // Only update imageUrl if it's a "clean" blob name, otherwise keep existing (for updates) or use whatever (for creates)
        ...(imageUrlToSave ? { imageUrl: imageUrlToSave } : {}),

        vendorName: dto.vendorName,
        vendorTaxId: dto.vendorTaxId,
        totalAmount: parseNumber(dto.totalAmount),
        currency: dto.currency,
        consumption: parseNumber(dto.consumption),
        unit: dto.unit,
        serviceType: this.mapServiceType(dto.serviceType),
        periodStart: safeDate(dto.periodStart),
        periodEnd: safeDate(dto.periodEnd),
        dueDate: safeDate(dto.dueDate),
        clientNumber: dto.clientNumber,
        status: InvoiceStatus.PROCESSED,
        processingStatus: ProcessingStatus.COMPLETED,
        source: dto.source || 'ai',
        aiConfidence: dto.aiConfidence,
        rawData: (dto.rawData ?? {}) as Prisma.InputJsonValue,
      };

      if (dto.pendingInvoiceId) {
        console.log(
          '[InvoiceService] Updating pending invoice',
          dto.pendingInvoiceId,
        );
        // Verify it belongs to tenant
        const pending = await this.prisma.invoice.findFirst({
          where: {
            id: dto.pendingInvoiceId,
            tenantId,
            deletedAt: null,
          },
        });

        if (pending) {
          // Update existing
          invoice = await this.prisma.invoice.update({
            where: { id: dto.pendingInvoiceId },
            data: {
              ...data,
              tenant: undefined, // Relation update syntax is different or handled by checks
              // Only update subtask if provided, otherwise leave as is
              subtask: dto.subtaskId
                ? { connect: { id: dto.subtaskId } }
                : undefined,
            },
          });
        } else {
          console.log(
            '[InvoiceService] Pending invoice not found, creating new',
          );
          // Fallback create
          // For create, we MUST have imageUrl. If we filtered it out above because it was a URL, we might fail constraint?
          // But wait, if imageUrlToSave was undefined because it was a SAS URL, we can't save "undefined" to required field in create.
          // So we must use original dto.imageUrl if creating scratch.
          const createData = {
            ...data,
            imageUrl: dto.imageUrl,
          } as Prisma.InvoiceCreateInput;
          invoice = await this.prisma.invoice.create({ data: createData });
        }
      } else {
        console.log('[InvoiceService] Creating new invoice');
        const createData = {
          ...data,
          imageUrl: dto.imageUrl,
        } as Prisma.InvoiceCreateInput;
        invoice = await this.prisma.invoice.create({ data: createData });
      }

      // 3. Trigger Emission Calculation
      if (
        invoice.consumption &&
        invoice.unit &&
        invoice.periodStart &&
        invoice.periodEnd
      ) {
        this.triggerCarbonCalculation(invoice).catch((err) =>
          this.logger.error(
            `Async carbon calc failed for invoice ${invoice.id}`,
            err,
          ),
        );
      }

      return invoice;
    } catch (error) {
      // Allow HttpExceptions to bubble up
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('[InvoiceService] Logic Error', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to create/confirm invoice: ${errorMessage}`,
        errorStack,
      );
      throw new InternalServerErrorException(
        `Invoice creation failed: ${errorMessage}`,
      );
    }
  }

  async triggerCarbonCalculation(invoice: Invoice) {
    try {
      if (!invoice.subtaskId) {
        // Invoice might not be linked to a subtask (e.g., generic upload), so skip carbon calc context
        return;
      }

      const subtask = await this.prisma.subtask.findFirst({
        where: {
          id: invoice.subtaskId,
          deletedAt: null,
        },
        include: { task: { include: { project: true } } },
      });

      if (!subtask) return;

      // Find or create Site linked to Project
      let site = await this.prisma.site.findFirst({
        where: { tenantId: invoice.tenantId, name: subtask.task.project.name },
      });

      if (!site) {
        site = await this.prisma.site.create({
          data: {
            tenantId: invoice.tenantId,
            name: subtask.task.project.name,
            internalCode: `PROJ-${subtask.task.projectId}`,
          },
        });
      }

      const activityData = await this.prisma.activityData.create({
        data: {
          siteId: site.id,
          periodStart: invoice.periodStart!,
          periodEnd: invoice.periodEnd!,
          consumptionValue: invoice.consumption!,
          originalUnit: invoice.unit!,
          cost: invoice.totalAmount || 0,
          serviceType: invoice.serviceType,
          status: DataStatus.CONFIRMED,
          evidenceUrl: invoice.imageUrl,
          metaData: { invoiceId: invoice.id, source: 'INVOICE_MODULE' },
        },
      });

      await this.carbonService.calculateFromActivity(activityData);
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to calculate carbon for invoice ${invoice.id}`,
        errorStack,
      );
    }
  }

  async getSubtaskSummary(subtaskId: string, tenantId: string) {
    await this.validateSubtaskOwnership(subtaskId, tenantId);

    const aggregations = await this.prisma.invoice.aggregate({
      where: {
        subtaskId,
        tenantId,
        status: InvoiceStatus.PROCESSED,
        deletedAt: null,
      },
      _sum: {
        consumption: true,
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalConsumption: aggregations._sum?.consumption || 0,
      totalCost: aggregations._sum?.totalAmount || 0,
      invoiceCount: aggregations._count?.id || 0,
      lastUpdated: new Date(),
    };
  }

  async createPendingInvoice(
    tenantId: string,
    data: {
      blobName: string;
      originalFilename: string;
      mimeType: string;
      subtaskId?: string;
    },
  ) {
    return this.prisma.invoice.create({
      data: {
        tenantId,
        subtaskId: data.subtaskId,
        imageUrl: data.blobName, // Store relative path/blobName, not full URL
        status: InvoiceStatus.PENDING_REVIEW,
        processingStatus: ProcessingStatus.PENDING,
        source: 'ai',
        rawData: {
          originalFilename: data.originalFilename,
          mimeType: data.mimeType,
        } as Prisma.InputJsonValue,
      },
    });
  }

  // Update getInvoicesBySubtask to sign URLs
  async getInvoicesBySubtask(subtaskId: string, tenantId: string) {
    await this.validateSubtaskOwnership(subtaskId, tenantId);
    const invoices = await this.prisma.invoice.findMany({
      where: {
        subtaskId,
        tenantId,
        deletedAt: null,
      }, // Return all (PENDING and PROCESSED)
      orderBy: { createdAt: 'desc' },
    });

    // Sign URLs
    return Promise.all(
      invoices.map(async (inv) => {
        try {
          // If it looks like a blobName (not a full URL), generate SAS
          if (!inv.imageUrl.startsWith('http')) {
            const sasUrl = await this.azureInvoiceService.getSasUrl(
              inv.imageUrl,
              tenantId,
            );
            return { ...inv, imageUrl: sasUrl, blobName: inv.imageUrl };
          }
          return inv;
        } catch {
          return inv; // Fallback
        }
      }),
    );
  }
}
