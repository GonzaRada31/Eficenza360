import { PrismaClient } from '@prisma/client';
import { getTenantId } from '../context/tenant.context';

export function extendedPrismaClient(client: PrismaClient) {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, args, query }: any) {
          const tenantId = getTenantId(); // Keep original getTenantId() call

          if (!tenantId) {
            return query(args);
          }

          if (operation === 'create' || operation === 'createMany') {
            return query(args);
          }

          if (tenantId) {
            if (!args) args = {};
            if (!args.where) {
              args.where = {};
            }
            args.where.tenantId = tenantId;
          }

          return query(args);
        },
      },
    },
  });
}
