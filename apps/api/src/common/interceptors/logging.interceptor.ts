import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  getTenantId,
  getCurrentUserId,
} from '../../infra/context/tenant.context';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    const tenantId = getTenantId() || 'None';
    const userId = getCurrentUserId() || 'None';

    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(
            `[${method}] ${url} - Tenant: ${tenantId} - User: ${userId} - ${Date.now() - now}ms`,
          ),
        ),
      );
  }
}
