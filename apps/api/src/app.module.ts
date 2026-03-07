import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IamModule } from './modules/iam/iam.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ProjectModulesModule } from './modules/project-modules/project-modules.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { ActivityDataModule } from './modules/activity-data/activity-data.module';
import { CarbonFootprintModule } from './modules/carbon-footprint/carbon-footprint.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { EnergyAuditModule } from './modules/energy-audit/energy-audit.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    IamModule,
    PrismaModule,
    ProjectsModule,
    CompaniesModule,
    ProjectModulesModule,

    InvoiceModule,
    ActivityDataModule,
    CarbonFootprintModule,
    AttachmentsModule,
    EnergyAuditModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
