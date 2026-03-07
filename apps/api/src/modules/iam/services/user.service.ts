import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { CreateUserDto } from '../dto/auth.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto, currentTenantId: string) {
    const passwordHash = await argon2.hash(dto.password);

    // Run in a transaction to ensure User and Outbox event are atomic
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          fullName: dto.fullName,
          tenantId: currentTenantId,
          status: 'ACTIVE',
        }
      });

      if (dto.roleId) {
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: dto.roleId,
            tenantId: currentTenantId,
          }
        });
        
        await tx.domainEventOutbox.create({
          data: {
            tenantId: currentTenantId,
            eventType: 'ROLE_ASSIGNED',
            payload: { userId: user.id, roleId: dto.roleId }
          }
        });
      }

      await tx.domainEventOutbox.create({
        data: {
          tenantId: currentTenantId,
          eventType: 'USER_CREATED',
          payload: { userId: user.id, email: user.email }
        }
      });

      return user;
    });
  }

  async findAll() {
    // Automatically scoped to tenant context via Prisma Proxy Extension!
    return this.prisma.tenantClient.user.findMany({
      select: { id: true, email: true, fullName: true, status: true, role: true }
    });
  }
}
