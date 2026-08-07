import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Registered account email address.',
    example: 'aarav.sharma@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsString()
  email!: string;

  @ApiProperty({
    description: 'Account password.',
    example: 'StrongPass@123',
    format: 'password',
    writeOnly: true,
  })
  @IsString()
  password!: string;
}
