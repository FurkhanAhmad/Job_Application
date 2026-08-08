import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //Register User
  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a user, hashes the password with bcrypt, and sets accessToken and refreshToken as HttpOnly cookies.',
  })
  @ApiCreatedResponse({
    description:
      'User registered successfully. Authentication cookies are set.',
    schema: {
      example: {
        user: {
          _id: '665c2f5a8f4e8b0012345678',
          fullname: 'Aarav Sharma',
          email: 'aarav.sharma@example.com',
          phoneNumber: '+91-9876543210',
          role: 'student',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body or validation failed.',
  })
  @ApiConflictResponse({
    description: 'An account with this email already exists.',
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setAuthCookies(response, result.tokens);

    return { user: result.user };
  }

  // Login User
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in a user',
    description:
      'Validates credentials, returns both JWT tokens, and also sets them as HttpOnly cookies.',
  })
  @ApiOkResponse({
    description: 'Login successful. Authentication cookies are set.',
    schema: {
      example: {
        user: {
          _id: '665c2f5a8f4e8b0012345678',
          fullname: 'Aarav Sharma',
          email: 'aarav.sharma@example.com',
          phoneNumber: '+91-9876543210',
          role: 'student',
        },
        tokens: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid email or password format.' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(response, result.tokens);

    return {
      user: result.user,
      tokens: result.tokens,
    };
  }

  //Logout User
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('accessToken')
  @ApiOperation({
    summary: 'Log out the current user',
    description:
      'Requires the accessToken cookie. Clears both authentication cookies and invalidates the stored refresh token.',
  })
  @ApiOkResponse({
    description: 'Logout successful. Authentication cookies are cleared.',
    schema: { example: { message: 'Logged out successfully' } },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid accessToken cookie.',
  })
  async logout(
    @Req() request: Request & { user: { id: string } },
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(request.user.id);
    response.clearCookie('accessToken', this.cookieOptions());
    response.clearCookie('refreshToken', this.cookieOptions());

    return { message: 'Logged out successfully' };
  }

  private setAuthCookies(
    response: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const options = this.cookieOptions();

    response.cookie('accessToken', tokens.accessToken, {
      ...options,
      maxAge: 15 * 60 * 1000,
    });
    response.cookie('refreshToken', tokens.refreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
  }
}
