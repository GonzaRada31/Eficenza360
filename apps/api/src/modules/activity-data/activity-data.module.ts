import { Module } from '@nestjs/common';
import { ActivityDataService } from './activity-data.service';
import { ActivityDataController } from './activity-data.controller';
import { PrismaModule } from '../../prisma/prisma.module';

import { CarbonFootprintModule } from '../carbon-footprint/carbon-footprint.module';

@Module({
  imports: [PrismaModule, CarbonFootprintModule],
  controllers: [ActivityDataController],
  providers: [ActivityDataService],
  exports: [ActivityDataService],
})
export class ActivityDataModule {}
