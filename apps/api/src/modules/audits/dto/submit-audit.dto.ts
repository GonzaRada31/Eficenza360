import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAuditDto {
  @ApiProperty({ description: 'Confirm that all required verification steps are done' })
  @IsBoolean()
  @IsNotEmpty()
  confirmVerification: boolean;
}
