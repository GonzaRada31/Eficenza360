import { Module } from '@nestjs/common';
import { EnergyAuditController } from './energy-audit.controller';
import { EnergyAuditService } from './energy-audit.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EnergyAuditController],
  providers: [EnergyAuditService],
  exports: [EnergyAuditService],
})
export class EnergyAuditModule {}
