import { Module } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { OutboxRelayWorker } from './outbox.relay.worker';

@Module({
  providers: [OutboxService, OutboxRelayWorker],
  exports: [OutboxService]
})
export class OutboxModule {}
