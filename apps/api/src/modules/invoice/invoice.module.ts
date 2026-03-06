import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { AzureInvoiceService } from './azure-invoice.service';
import { InvoiceService } from './invoice.service';
import { CarbonFootprintModule } from '../carbon-footprint/carbon-footprint.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { IamModule } from '../iam/iam.module';
import { StorageModule } from '../../infra/storage/storage.module';

@Module({
  imports: [PrismaModule, ConfigModule, CarbonFootprintModule, IamModule, StorageModule],
  controllers: [InvoiceController],
  providers: [AzureInvoiceService, InvoiceService],
  exports: [AzureInvoiceService, InvoiceService],
})
export class InvoiceModule {}
