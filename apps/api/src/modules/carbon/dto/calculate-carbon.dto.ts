import { IsNotEmpty, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateActivityDto } from './create-activity.dto';

export class CalculateCarbonDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Energy Audit UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  auditId: string;

  @ApiProperty({
    type: [CreateActivityDto],
    description: 'List of activities to calculate',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityDto)
  activities: CreateActivityDto[];
}
