import { IsEnum, IsNotEmpty, NotEquals } from 'class-validator';
import { AuditStatus } from '@prisma/client';

export class UpdateAuditStatusDto {
  @IsEnum(AuditStatus)
  @IsNotEmpty()
  @NotEquals(AuditStatus.VALIDATED, {
  message: 'No puede establecer el estado a VALIDATED directamente. Utilice el endpoint de validación específico que ejecuta el Snapshotting legal.',
  })
  status: AuditStatus;
}
