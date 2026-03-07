import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async notifyTenantAdmin(tenantId: string, title: string, message: string) {
    this.logger.log(`Dispatching Notification [${title}] to Tenant ${tenantId}`);
    
    // In a real system, you'd lookup users with 'Admin' role in this tenant first
    return this.prisma.notification.create({
      data: {
        tenantId,
        type: 'SYSTEM_ALERT',
        title,
        message,
        severity: 'INFO',
      }
    });
  }

  async notifyReviewers(tenantId: string, documentName: string) {
    this.logger.log(`Notifying Reviewers for Document Upload: ${documentName}`);

    return this.prisma.notification.create({
      data: {
        tenantId,
        type: 'REPORT_READY',
        title: 'New Document Uploaded',
        message: `A new document "${documentName}" is awaiting review.`,
        severity: 'INFO',
      }
    });
  }
}
