import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmissionFactorsService } from './emission-factors.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { Prisma } from '@prisma/client';

@ApiTags('Emission Factors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('emission-factors')
export class EmissionFactorsController {
  constructor(private readonly service: EmissionFactorsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los factores de emisión' })
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo factor de emisión' })
  create(@Body() body: Prisma.EmissionFactorCreateInput) {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar factor de emisión' })
  update(
    @Param('id') id: string,
    @Body() body: Prisma.EmissionFactorUpdateInput,
  ) {
    return this.service.update(id, body);
  }
}
