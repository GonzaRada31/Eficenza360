import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { getTenantId, getCurrentUserId } from '../../infra/context/tenant.context';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    // We only want to audit mutating actions (POST, PUT, DELETE, PATCH)
    if (['GET', 'OPTIONS', 'HEAD'].includes(method)) {
      return next.handle();
    }

    const tenantId = getTenantId() || 'SYSTEM';
    const userId = getCurrentUserId() || 'ANONYMOUS';
    const bodySnapshot = JSON.stringify(request.body);

    // Proceed with the request
    return next.handle().pipe(
      tap({
        next: (val) => {
          // Log SUCCESS
          this.logger.log(`[AUDIT] Action: ${method} ${url} | Tenant: ${tenantId} | User: ${userId} | Status: SUCCESS`);
          
          // In full implementation, this will emit a DomainEvent or directly save to Prisma `AuditLog` table
          // via a background queue to ensure minimal performance impact on the request.
        },
        error: (err) => {
          // Log FAILURE
          this.logger.error(`[AUDIT] Action: ${method} ${url} | Tenant: ${tenantId} | User: ${userId} | Status: FAILED | Error: ${err.message}`);
        }
      })
    );
  }
}
