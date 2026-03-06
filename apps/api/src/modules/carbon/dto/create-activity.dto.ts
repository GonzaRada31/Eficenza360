import { IsString, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty({ example: 'electricity', description: 'Type of activity' })
  @IsString()
  @IsNotEmpty()
  activityType!: string;

  @ApiProperty({ example: 1500.5, description: 'Value of the activity (must be > 0)' })
  @IsNumber()
  @Min(0.01)
  activityValue!: number;

  @ApiProperty({ example: 'kWh' })
  @IsString()
  @IsNotEmpty()
  activityUnit!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'UUID of the applied emission factor' })
  @IsUUID()
  @IsNotEmpty()
  factorId!: string;
}
