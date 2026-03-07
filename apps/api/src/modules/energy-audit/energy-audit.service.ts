import { Prisma } from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEnergyAuditDto } from './dto/create-energy-audit.dto';
import { UpsertEnergyRecordItemDto } from './dto/upsert-energy-record.dto';
import { OCCConflictException } from './exceptions/occ-conflict.exception';
import { AuditStatus, OutboxStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class EnergyAuditService {
  constructor(private prisma: PrismaService) {}

  async createAudit(tenantId: string, dto: CreateEnergyAuditDto) {
    return this.prisma.energyAudit.create({
      data: {
        tenantId, // Hyper-isolated creation
        companyId: dto.companyId,
        name: dto.name,
        year: dto.year,
        status: AuditStatus.DRAFT,
      },
    });
  }

  async getAuditById(tenantId: string, auditId: string) {
    // FIX PACK: No records include to prevent OOM
    // FIX PACK: findFirst with tenantId isolation at SQL level
    const audit = await this.prisma.energyAudit.findFirst({
      where: {
        id: auditId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!audit) {
      throw new NotFoundException('Auditoría no encontrada o sin acceso');
    }

    return audit;
  }

  // FIX PACK: Paginated records retrieval instead of bloated include
  async getAuditRecords(
    tenantId: string,
    auditId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const skip = (page - 1) * limit;

    const [total, records] = await Promise.all([
      this.prisma.energyRecord.count({
        where: { auditId, tenantId, deletedAt: null },
      }),
      this.prisma.energyRecord.findMany({
        where: { auditId, tenantId, deletedAt: null },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // FIX PACK: OCC Applied to any mutation like status
  async updateStatus(tenantId: string, auditId: string, status: AuditStatus) {
    const audit = await this.getAuditById(tenantId, auditId);

    // Abstract Finite State Machine: Only allow certain logical leaps
    if (audit.status === AuditStatus.LOCKED) {
      throw new BadRequestException(
        'La auditoría está bloqueada y no puede modificarse.',
      );
    }

    if (status === AuditStatus.VALIDATED) {
      throw new BadRequestException(
        'La validación debe ejecutarse mediante el proceso de deep freeze (validateAudit).',
      );
    }

    // OCC Patrón estricto
    const result = await this.prisma.energyAudit.updateMany({
      where: {
        id: audit.id,
        tenantId,
        version: audit.version,
      },
      data: {
        status,
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      throw new OCCConflictException('EnergyAudit', auditId);
    }

    return this.getAuditById(tenantId, auditId); // returns updated
  }

  // FIX PACK: Exclusive Validator Method (Transactional) con Chunking Cursor-based
  async validateAudit(tenantId: string, auditId: string) {
    const audit = await this.getAuditById(tenantId, auditId);

    if (
      audit.status === AuditStatus.VALIDATED ||
      audit.status === AuditStatus.LOCKED
    ) {
      throw new BadRequestException('Operación no permitida en este estado.');
    }

    // Interactive Transaction con Timeout adaptado a bulk processing (15s máximo seguro)
    return this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. OCC Lock on Audit
        const auditUpdate = await tx.energyAudit.updateMany({
          where: { id: auditId, tenantId, version: audit.version },
          data: { status: AuditStatus.VALIDATED, version: { increment: 1 } },
        });

        if (auditUpdate.count === 0) {
          throw new OCCConflictException('EnergyAudit', auditId);
        }

        // 2. Create Parent Snapshot
        const snapshot = await tx.energyAuditSnapshot.create({
          data: {
            tenantId,
            originalAuditId: audit.id,
            auditName: audit.name,
            auditYear: audit.year,
          },
        });

        // 3. Obtener el monto total de registros antes de iterar para validación forense
        const totalRecords = await tx.energyRecord.count({
          where: { auditId, tenantId, deletedAt: null },
        });

        if (totalRecords > 0) {
          const CHUNK_SIZE = 500;
          let lastId: string | undefined = undefined;
          let recordsProcessed = 0;

          // 4. Cursor-Based Pagination Loop.
          // Mientras existan registros pendientes por procesar, itera consultando de a CHUNK_SIZE.
          while (recordsProcessed < totalRecords) {
            // Búsqueda del lote. Desvinculamos datos innecesarios a Memoria (Sin spread completo)
            const recordsChunk: any = await tx.energyRecord.findMany({
              where: { auditId, tenantId, deletedAt: null },
              take: CHUNK_SIZE,
              skip: lastId ? 1 : 0,
              cursor: lastId ? { id: lastId } : undefined,
              orderBy: { id: 'asc' }, // Index ordenado obligatorio pre-generado por el UUID default
              select: {
                id: true,
                recordType: true,
                category: true,
                consumptionValue: true,
                unit: true,
                cost: true,
                emissionFactor: {
                  select: {
                    factorValue: true,
                    source: true,
                  },
                },
              },
            });

            if (recordsChunk.length === 0) break; // Fallback loop defense

            lastId = recordsChunk[recordsChunk.length - 1].id;

            // Inyección Bulk del Lote exacto
            await tx.energyAuditSnapshotRecord.createMany({
              data: recordsChunk.map((r: any) => ({
                snapshotId: snapshot.id,
                originalRecordId: r.id,
                recordType: r.recordType,
                category: r.category,
                consumptionValue: r.consumptionValue,
                unit: r.unit,
                cost: r.cost,
                appliedEmissionFactorValue: r.emissionFactor?.factorValue,
                appliedEmissionFactorSource: r.emissionFactor?.source,
              })),
            });

            recordsProcessed += recordsChunk.length;

            // Garbage Collection: El array local resourcesChunk pierde su referencia en el ciclo 'while',
            // permitiendo que el V8 (Node.js) limpie esa memoria de los maps anteriores. No hay acumulación.
          }
        }

        // 5. Insertar DomainEventOutbox (status = PENDING)
        const eventId = crypto.randomUUID();
        await tx.domainEventOutbox.create({
          data: {
            tenantId,
            eventType: 'ENERGY_AUDIT_VALIDATED',
            payload: {
              eventId,
              tenantId,
              auditId,
              snapshotId: snapshot.id,
              companyId: audit.companyId,
              year: audit.year,
              validatedAt: new Date().toISOString(),
              normativaVersion: 'v1',
            },
            status: OutboxStatus.PENDING,
            retryCount: 0,
          },
        });

        return {
          snapshotId: snapshot.id,
          status: AuditStatus.VALIDATED,
          recordsCloned: totalRecords,
        };
      },
      { timeout: 15000 },
    ); // Ampliación controlada de timeout por la latencia en inserción masiva.
  }

  // OCC Strategy Executed
  async upsertRecord(
    tenantId: string,
    auditId: string,
    dto: UpsertEnergyRecordItemDto,
  ) {
    // Verify Audit is not Validated or Locked
    const audit = await this.getAuditById(tenantId, auditId);
    if (
      audit.status === AuditStatus.VALIDATED ||
      audit.status === AuditStatus.LOCKED
    ) {
      throw new BadRequestException(
        'Auditoría validada/cerrada. Sus registros son inmutables (Deep Freeze).',
      );
    }

    if (dto.id) {
      // UPDATE BRANCH (with OCC and tenantId in DB query)
      if (dto.version === undefined) {
        throw new BadRequestException(
          'Actualizaciones requieren proporcionar la current version (OCC)',
        );
      }

      const result = await this.prisma.energyRecord.updateMany({
        where: {
          id: dto.id,
          tenantId, // Filter enforced at SQL level
          auditId,
          version: dto.version, // OCC Magic
        },
        data: {
          category: dto.category,
          unit: dto.unit,
          consumptionValue: dto.consumptionValue,
          cost: dto.cost,
          evidenceUrl: dto.evidenceUrl,
          recordType: dto.recordType,
          emissionFactorId: dto.emissionFactorId,
          version: { increment: 1 }, // Atomically bump version
        },
      });

      if (result.count === 0) {
        throw new OCCConflictException('EnergyRecord', dto.id);
      }

      return this.prisma.energyRecord.findFirst({
        where: { id: dto.id, tenantId },
      });
    } else {
      // CREATE BRANCH
      return this.prisma.energyRecord.create({
        data: {
          tenantId,
          auditId,
          recordType: dto.recordType,
          category: dto.category,
          consumptionValue: dto.consumptionValue,
          unit: dto.unit,
          cost: dto.cost,
          evidenceUrl: dto.evidenceUrl,
          emissionFactorId: dto.emissionFactorId,
          deduplicationKey: dto.deduplicationKey,
        },
      });
    }
  }
}
