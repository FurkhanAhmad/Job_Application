import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

function transformSkills(value: unknown): unknown {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return value;

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    return [value];
  }
}

export class CreateProfileDto {
  @ApiPropertyOptional({
    example: 'Full Stack Developer with 2 years of experience.',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: ['Node.js', 'NestJS', 'MongoDB'],
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => transformSkills(value))
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({
    example: '665c2f5a8f4e8b0012345678',
    description: 'Optional MongoDB ID of the linked company.',
  })
  @IsOptional()
  @IsMongoId()
  company?: string;
}
