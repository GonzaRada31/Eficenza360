import { Module } from '@nestjs/common';
import { CarbonFootprintController } from './carbon-footprint.controller';
import { CarbonCalculationService } from './carbon-calculation.service';
import { EmissionFactorsService } from './emission-factors.service';
import { EmissionFactorsController } from './emission-factors.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CarbonFootprintController, EmissionFactorsController],
  providers: [CarbonCalculationService, EmissionFactorsService],
  exports: [CarbonCalculationService], // Export so ActivityDataModule can use it
})
export class CarbonFootprintModule {}
