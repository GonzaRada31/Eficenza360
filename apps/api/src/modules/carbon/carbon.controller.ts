import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CarbonService } from './services/carbon.service';
import { CalculateCarbonDto } from './dto/calculate-carbon.dto';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';

@ApiTags('Carbon Engine')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@UseInterceptors(LoggingInterceptor, ResponseInterceptor)
@Controller('carbon')
export class CarbonController {
  constructor(private readonly carbonService: CarbonService) {}

  @ApiOperation({ summary: 'Calculate carbon footprint from a list of activities' })
  @ApiResponse({ status: 200, description: 'Carbon Calculation Report created successfully' })
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @Permissions('carbon.calculate')
  async calculate(@Body() dto: CalculateCarbonDto) {
    // Note: If dto.activities is required to be saved before calculation, it would happen here 
    // or inside the carbonService.calculateAndReport via extended implementation.
    return this.carbonService.calculateAndReport(dto.auditId);
  }
}
