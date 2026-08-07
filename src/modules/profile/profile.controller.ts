import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserProfileService } from "./profile.service";
import { CreateProfileDto } from "./dto/create-profile";

@ApiTags("Profile")
@Controller("profile")
export class ProfileController {
  constructor(
    private readonly profileService: UserProfileService,
  ) {}

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

  @Post("create")
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create Profile",
    description: "Creates a new user profile.",
  })
  @ApiBody({
    type: CreateProfileDto,
    description: "Profile Details",
    examples: {
      profile: {
        summary: "Create Profile Example",
        value: {
          bio: "Passionate Full Stack Developer",
          skills: [
            "Node.js",
            "NestJS",
            "MongoDB",
            "React",
            "TypeScript",
          ],
          resume:
            "https://res.cloudinary.com/demo/raw/upload/v123456789/resume.pdf",
          resumeOriginalName: "Furkan_Ahmad_Resume.pdf",
          profilePhoto:
            "https://res.cloudinary.com/demo/image/upload/v123456789/profile.jpg",
          company: "665c2f5a8f4e8b0012345678",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Profile created successfully.",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid request data.",
  })
  @ApiResponse({
    status: 404,
    description: "User not found.",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error.",
  })
  async createProfile(
    @Body() createProfileDto: CreateProfileDto,
    @CurrentUser() currentUser: { id: string },
  ) {
    return await this.profileService.createProfile(createProfileDto, currentUser.id);
  }
}
