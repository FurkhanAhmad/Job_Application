import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ApplyJobDto {
  @ApiProperty({
    description: 'ID of the job the user wants to apply for.',
    example: '68933b46d7c7b8d4f2a12345',
  })
  @IsMongoId()
  @IsNotEmpty()
  job!: string;
}
