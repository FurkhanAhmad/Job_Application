import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { JobType } from 'src/models/job.model';

export class CreateJobDto {
  @ApiProperty({
    example: 'Backend Developer',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'Build scalable backend APIs.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: ['Node.js', 'NestJS', 'MongoDB'],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  requirements!: string[];

  @ApiProperty({
    example: 1200000,
  })
  @IsNumber()
  @Min(0)
  salary!: number;

  @ApiProperty({
    example: 'Bangalore, India',
  })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiProperty({
    enum: JobType,
    example: JobType.FULL_TIME,
  })
  @IsEnum(JobType)
  jobType!: JobType;

  @ApiProperty({
    example: 3,
  })
  @IsInt()
  @Min(0)
  experience!: number;

  @ApiProperty({
    example: 2,
  })
  @IsInt()
  @Min(1)
  position!: number;

  @ApiProperty({
    example: '68933b46d7c7b8d4f2a12345',
  })
  @IsMongoId()
  companyId!: string;
}
