import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../models/user.model';

export class RegisterDto {
  @ApiProperty({
    description: 'User full name.',
    example: 'Aarav Sharma',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  fullName!: string;

  @ApiProperty({
    description: 'Unique email address used for login.',
    example: 'aarav.sharma@example.com',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Contact phone number.',
    example: '+91-9876543210',
  })
  @IsString()
  phoneNumber!: string;

  @ApiProperty({
    description: 'Minimum 8 characters; stored as a bcrypt hash.',
    example: 'StrongPass@123',
    minLength: 8,
    format: 'password',
    writeOnly: true,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({
    description: 'Account role. Defaults to student when omitted.',
    enum: UserRole,
    example: UserRole.STUDENT,
    default: UserRole.STUDENT,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
