import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';
import { Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest<Request>()) as string,
      message:
        exception instanceof HttpException
          ? exception.message
          : 'Internal server error',
    };

    // Log details
    const logMessage = `
============================================================
TIME: ${new Date().toISOString()}
PATH: ${responseBody.path}
STATUS: ${httpStatus}
ERROR: ${exception instanceof Error ? exception.message : String(exception)}
STACK: ${exception instanceof Error ? exception.stack : 'No stack trace'}
============================================================
`;

    // Console log
    this.logger.error(logMessage);

    // File log (append)
    try {
      const logPath = path.resolve(process.cwd(), 'error.log');
      fs.appendFileSync(logPath, logMessage);
    } catch (err) {
      console.error('Failed to write to error.log', err);
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
