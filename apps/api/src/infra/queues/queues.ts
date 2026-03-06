import { QueueFactory } from './queue.factory';
import { QUEUE_NAMES } from './queue.constants';

export const queues = {
  auditEvents: QueueFactory.createQueue(QUEUE_NAMES.AUDIT_EVENTS),
  carbonEvents: QueueFactory.createQueue(QUEUE_NAMES.CARBON_EVENTS),
  documentEvents: QueueFactory.createQueue(QUEUE_NAMES.DOCUMENT_EVENTS),
  notifications: QueueFactory.createQueue(QUEUE_NAMES.NOTIFICATIONS),
  billing: QueueFactory.createQueue(QUEUE_NAMES.BILLING),
  deadLetter: QueueFactory.createQueue(QUEUE_NAMES.DEAD_LETTER),
};
