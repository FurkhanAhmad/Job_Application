import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApplyJobDto } from './dto/apply-job.dto';
import { ApplicationService } from './application.service';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@ApiTags('Application Management')
@ApiBearerAuth()
@Controller('applications')
@UseGuards(AuthGuard('jwt'))
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a job application' })
  @ApiCreatedResponse({ description: 'Application submitted successfully.' })
  async applyForJob(
    @Body() applyJobDto: ApplyJobDto,
    @CurrentUser() currentUser: { id: string },
  ) {
    return this.applicationService.applyForJob(applyJobDto, currentUser.id);
  }

  @Get('my-applications')
  @ApiOperation({ summary: 'View my submitted applications' })
  @ApiOkResponse({ description: 'Applications retrieved successfully.' })
  async getMyApplications(@CurrentUser() currentUser: { id: string }) {
    return this.applicationService.getMyApplications(currentUser.id);
  }

  @Get('received')
  @ApiOperation({ summary: 'View applications received for my jobs' })
  @ApiOkResponse({
    description: 'Received applications retrieved successfully.',
  })
  async getReceivedApplications(@CurrentUser() currentUser: { id: string }) {
    return this.applicationService.getReceivedApplications(currentUser.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'View the latest status of my application' })
  @ApiParam({
    name: 'id',
    description: 'Application document ID',
    example: '6a777ae40e12a463c3d47490',
  })
  @ApiOkResponse({ description: 'Application details retrieved successfully.' })
  async getMyApplicationById(
    @Param('id') applicationId: string,
    @CurrentUser() currentUser: { id: string },
  ) {
    return this.applicationService.getMyApplicationById(
      applicationId,
      currentUser.id,
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update the status of a job application' })
  @ApiParam({
    name: 'id',
    description: 'Application document ID',
    example: '6a777ae40e12a463c3d47490',
  })
  @ApiOkResponse({ description: 'Application status updated successfully.' })
  async updateApplicationStatus(
    @Param('id') applicationId: string,
    @Body() statusDto: UpdateApplicationStatusDto,
    @CurrentUser() currentUser: { id: string },
  ) {
    return this.applicationService.updateApplicationStatus(
      applicationId,
      statusDto,
      currentUser.id,
    );
  }
}
