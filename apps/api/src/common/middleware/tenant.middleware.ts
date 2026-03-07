import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { tenantContext } from '../../infra/context/tenant.context';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // In a real app, you might extract this from a JWT token rather than headers directly,
    // or validate it securely.
    const tenantIdHeader = req.headers['x-tenant-id'] as string | undefined;

    // Attempt to extract userId if token is present (Decoded later by AuthGuard, but context set here)
    // This is purely structural for the skeleton.
    const userIdHeader = req.headers['x-user-id'] as string | undefined;

    // OpenTelemetry standard traceId
    const traceId = (req.headers['x-trace-id'] as string) || uuidv4();

    const payload = {
      tenantId: tenantIdHeader || null,
      userId: userIdHeader || null,
      traceId: traceId,
    };

    // Run the entire request pipeline within this ALS context
    tenantContext.run(payload, () => {
      next();
    });
  }
}
