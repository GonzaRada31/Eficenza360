export const QUEUE_NAMES = {
  AUDIT_EVENTS: 'audit-events',
  CARBON_EVENTS: 'carbon-events',
  DOCUMENT_EVENTS: 'document-events',
  NOTIFICATIONS: 'notifications',
  BILLING: 'billing',
  DEAD_LETTER: 'dead-letter',
};

// Queue Routing Logic from Relayer
export const EVENT_ROUTING_MAP: Record<string, string> = {
  'AUDIT_CREATED': QUEUE_NAMES.AUDIT_EVENTS,
  'AUDIT_SUBMITTED': QUEUE_NAMES.AUDIT_EVENTS,
  'CARBON_CALCULATED': QUEUE_NAMES.CARBON_EVENTS,
  'DOCUMENT_UPLOADED': QUEUE_NAMES.DOCUMENT_EVENTS,
  'TENANT_CREATED': QUEUE_NAMES.BILLING, // Could map to multiple, handled by fan-out if needed, but routing implies primary processor
  'USER_CREATED': QUEUE_NAMES.NOTIFICATIONS, // Example
};
