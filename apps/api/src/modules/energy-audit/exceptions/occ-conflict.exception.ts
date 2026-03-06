import { ConflictException } from '@nestjs/common';

export class OCCConflictException extends ConflictException {
  constructor(entityType: string, entityId: string) {
    super({
      statusCode: 409,
      errorCode: 'OCC_CONFLICT_DETECTED',
      message: 'El registro fue modificado por otro usuario de tu organización. Por favor recarga para ver los nuevos datos.',
      details: {
        entityType,
        entityId,
      },
    });
  }
}
