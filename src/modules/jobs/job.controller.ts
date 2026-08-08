import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { JobService } from './job.service';

@ApiTags('Job Management')
@ApiBearerAuth()
@Controller('jobs')
@UseGuards(AuthGuard('jwt'))
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new job posting' })
  @ApiCreatedResponse({ description: 'Job created successfully.' })
  @ApiNotFoundResponse({ description: 'Company not found.' })
  async createJob(
    @Body() createJobDto: CreateJobDto,
    @CurrentUser() currentUser: { id: string },
  ) {
    return this.jobService.createJob(createJobDto, currentUser.id);
  }

  @Get()
  @ApiOperation({ summary: 'Browse all available job postings' })
  @ApiOkResponse({ description: 'Jobs retrieved successfully.' })
  async getAllJobs() {
    return this.jobService.getAllJobs();
  }

  @Get('my-jobs')
  @ApiOperation({ summary: 'View job postings created by me' })
  @ApiOkResponse({ description: 'User jobs retrieved successfully.' })
  async getMyJobs(@CurrentUser() currentUser: { id: string }) {
    return this.jobService.getJobsByUser(currentUser.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'View a job posting by ID' })
  @ApiParam({
    name: 'id',
    description: 'Job document ID',
    example: '6a7762eaeb8e8dcb394b4de7',
  })
  @ApiOkResponse({ description: 'Job retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Job not found.' })
  async getJobById(@Param('id') jobId: string) {
    return this.jobService.getJobById(jobId);
  }
}
