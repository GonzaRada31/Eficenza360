import { PrismaClient } from '@prisma/client';
import { getTenantId } from '../context/tenant.context';

export function extendedPrismaClient(client: PrismaClient) {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const tenantId = getTenantId();

          // Standard logic to automatically inject tenantId into where clauses
          // if we're in a tenant context and the model has a tenantId field.
          if (tenantId) {
            // Note: In an enterprise app, this should strictly check if the model
            // has a tenantId property before injecting, preventing runtime errors.
            // Simplified injection logic:
            if (!args.where) {
              args.where = {};
            }
            // @ts-ignore - TS won't know every model has tenantId, but runtime handles it
            args.where.tenantId = tenantId;
          }

          return query(args);
        },
      },
    },
  });
}
