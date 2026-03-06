import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { extendedPrismaClient } from './prisma-tenant.extension';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  // Returns the instance wrapped with multi-tenant interceptors (RLS equivalent at app level)
  get tenantClient() {
    return extendedPrismaClient(this);
  }
}
