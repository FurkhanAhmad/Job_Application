import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    example: 'OpenAI',
    description: 'Company name',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example:
      'OpenAI is an AI research and deployment company focused on building safe and beneficial artificial intelligence.',
    description: 'Company description',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: 'https://openai.com',
    description: 'Official company website',
  })
  @IsUrl()
  @IsNotEmpty()
  website!: string;

  @ApiProperty({
    example: 'San Francisco, California, USA',
    description: 'Company location',
  })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiPropertyOptional({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1754567890/company-logo.png',
    description: 'Company logo URL',
  })
  @IsOptional()
  @IsString()
  logo?: string;
}
