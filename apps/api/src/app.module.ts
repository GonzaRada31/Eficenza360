import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IamModule } from './modules/iam/iam.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ProjectModulesModule } from './modules/project-modules/project-modules.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    IamModule,
    PrismaModule,
    ProjectsModule,
    CompaniesModule,
    ProjectModulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
