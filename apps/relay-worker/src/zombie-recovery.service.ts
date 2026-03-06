import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class ZombieRecoveryService {
  private readonly logger = new Logger(ZombieRecoveryService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async recoverZombies() {
    try {
      this.logger.debug('Executing Zombie Recovery Job...');

      // 1. Recover to PENDING events stuck in PROCESSING for > 5 mins
      const recovered = await this.prisma.$executeRaw`
        UPDATE "domain_event_outboxes"
        SET status = 'PENDING',
            locked_at = NULL,
            retry_count = retry_count + 1
        WHERE status = 'PROCESSING'
          AND locked_at < NOW() - INTERVAL '5 minutes'
          AND retry_count < 10;
      `;

      if (recovered > 0) {
        this.logger.warn({
          msg: 'Recovered ZOMBIE outbox events',
          count: recovered,
          action: 'outbox_zombie_recovery',
          to_status: 'PENDING'
        });
      }

      // 2. Quarantine chronic failers to FAILED
      const failed = await this.prisma.$executeRaw`
        UPDATE "domain_event_outboxes"
        SET status = 'FAILED'
        WHERE status = 'PROCESSING'
          AND locked_at < NOW() - INTERVAL '5 minutes'
          AND retry_count >= 10;
      `;

      if (failed > 0) {
        this.logger.error({
          msg: 'Quarantined DEAD outbox events',
          count: failed,
          action: 'outbox_zombie_quarantine',
          to_status: 'FAILED'
        });
      }

    } catch (error) {
       this.logger.error({
         msg: 'Zombie Recovery Failed',
         error: error instanceof Error ? error.message : error
       });
    }
  }
}
