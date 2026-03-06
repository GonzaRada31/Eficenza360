import { Module } from '@nestjs/common';
import { CarbonController } from './carbon.controller';
import { CarbonService } from './services/carbon.service';
import { OccService } from './services/occ.service';
import { EmissionFactorService } from './services/emission-factor.service';

@Module({
  controllers: [CarbonController],
  providers: [CarbonService, OccService, EmissionFactorService],
  exports: [CarbonService],
})
export class CarbonModule {}
