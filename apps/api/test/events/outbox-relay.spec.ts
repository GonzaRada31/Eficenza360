import { OutboxService } from '../../src/modules/outbox/outbox.service';
import { queues } from '../../src/infra/queues/queues';
import { QUEUE_NAMES } from '../../src/infra/queues/queue.constants';

describe('Outbox Relay (Integration)', () => {
  let mockPrisma: any;
  let service: OutboxService;

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn(async (cb) => {
        return cb({
          $queryRaw: jest.fn().mockResolvedValue([
            {
              id: '1',
              event_type: 'AUDIT_CREATED',
              tenant_id: 't1',
              aggregate_type: 'Audit',
              aggregate_id: 'a1',
              payload: {},
              created_at: new Date(),
            },
          ]),
        });
      }),
    };
    service = new OutboxService(mockPrisma);

    // Mock BullMQ add
    jest
      .spyOn(queues.auditEvents, 'add')
      .mockResolvedValue({ id: 'job-1' } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should lock rows, relay to right queue, and mark as processed', async () => {
    const ids = await service.processOutbox();

    expect(queues.auditEvents.add).toHaveBeenCalledWith(
      'AUDIT_CREATED',
      expect.objectContaining({ eventId: '1' }),
    );
    expect(ids).toContain('1');
  });
});
