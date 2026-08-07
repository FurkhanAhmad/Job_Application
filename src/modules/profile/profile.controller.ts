import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile';
import { UpdateProfileDto } from './dto/update-profile';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: UserProfileService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile linked to the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile fetched successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found for the current user.',
  })
  async getMyProfile(@CurrentUser() currentUser: { id: string }) {
    return await this.profileService.getMyProfile(currentUser.id);
  }

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bio: { type: 'string' },
        skills: { type: 'array', items: { type: 'string' } },
        company: { type: 'string', example: '665c2f5a8f4e8b0012345678' },
        profilePhoto: { type: 'string', format: 'binary' },
        resume: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profilePhoto', maxCount: 1 },
        { name: 'resume', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { files: 2, fileSize: 10 * 1024 * 1024 },
      },
    ),
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Profile',
    description: 'Creates a new user profile.',
  })
  @ApiResponse({
    status: 201,
    description: 'Profile created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async createProfile(
    @Body() createProfileDto: CreateProfileDto,
    @CurrentUser() currentUser: { id: string },
    @UploadedFiles()
    files: {
      profilePhoto?: Express.Multer.File[];
      resume?: Express.Multer.File[];
    },
  ) {
    return await this.profileService.createProfile(
      createProfileDto,
      currentUser.id,
      files,
    );
  }

  @Patch('update')
  @UseGuards(AuthGuard('jwt'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bio: { type: 'string' },
        skills: { type: 'array', items: { type: 'string' } },
        company: { type: 'string', example: '665c2f5a8f4e8b0012345678' },
        profilePhoto: { type: 'string', format: 'binary' },
        resume: { type: 'string', format: 'binary' },
      },
      description: 'Only fields provided in the request will be updated.',
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profilePhoto', maxCount: 1 },
        { name: 'resume', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { files: 2, fileSize: 10 * 1024 * 1024 },
      },
    ),
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates text fields and optionally replaces profile files.',
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() currentUser: { id: string },
    @UploadedFiles()
    files: {
      profilePhoto?: Express.Multer.File[];
      resume?: Express.Multer.File[];
    },
  ) {
    return await this.profileService.updateProfile(
      updateProfileDto,
      currentUser.id,
      files,
    );
  }
}
