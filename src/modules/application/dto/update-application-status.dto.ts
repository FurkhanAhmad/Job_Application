import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { ApplicationStatus } from 'src/models/application.model';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    enum: ApplicationStatus,
    example: ApplicationStatus.ACCEPTED,
  })
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;
}
