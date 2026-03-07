import { PrismaClient } from '@prisma/client';

export class IdempotencyValidator {
  constructor(private readonly prisma: PrismaClient) {}

  // Returns true if the event has already been processed by this worker
  async hasProcessed(eventId: string, workerName: string): Promise<boolean> {
    const existing = await this.prisma.eventProcessingLog.findUnique({
      where: { eventId },
    });
    return !!existing;
  }

  // Marks an event as processed
  async markProcessed(eventId: string, workerName: string): Promise<void> {
    await this.prisma.eventProcessingLog.create({
      data: {
        eventId,
        worker: workerName,
      },
    });
  }
}
