import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { OutboxService } from './outbox.service';

@Injectable()
export class OutboxRelayWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayWorker.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(private readonly outboxService: OutboxService) {}

  onModuleInit() {
    this.logger.log('Starting Outbox Relay Polling...');
    this.poll();
  }

  onModuleDestroy() {
    if (this.timer) clearTimeout(this.timer);
    this.logger.log('Stopped Outbox Relay.');
  }

  private poll() {
    // Poll every 2 seconds roughly, depending on load
    this.timer = setTimeout(async () => {
      if (!this.isProcessing) {
        this.isProcessing = true;
        await this.outboxService.processOutbox();
        this.isProcessing = false;
      }
      this.poll(); // Recurse
    }, 2000);
  }
}
