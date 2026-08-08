import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Company, CompanyDocument } from 'src/models/company.model';
import { Job, JobDocument } from 'src/models/job.model';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,
    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>,
  ) {}

  async createJob(
    createJobDto: CreateJobDto,
    userId: string,
  ): Promise<JobDocument> {
    // The authenticated user's ID becomes created_by; it is never accepted from the request body.
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID.');
    }

    const company = await this.companyModel
      .findOne({ _id: createJobDto.companyId, userId })
      .select('_id')
      .lean()
      .exec();

    if (!company) {
      throw new NotFoundException(
        'Company not found or does not belong to the current user.',
      );
    }

    const requirements = Array.isArray(createJobDto.requirements)
      ? createJobDto.requirements.map((item) => item.trim()).filter(Boolean)
      : [];

    return this.jobModel.create({
      ...createJobDto,
      requirements,
      created_by: new Types.ObjectId(userId),
      // applications is omitted because the schema initializes it to [].
    });
  }

  // Students browse all published jobs.
  async getAllJobs(): Promise<JobDocument[]> {
    return this.jobModel
      .find()
      .sort({ createdAt: -1 })
      .populate('companyId', 'name logo location')
      .exec();
  }
  // Recruiters view only the jobs they created.
  async getJobsByUser(userId: string): Promise<JobDocument[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID.');
    }
    return this.jobModel
      .find({ created_by: userId })
      .sort({ createdAt: -1 })
      .populate('companyId', 'name logo location')
      .exec();
  }
  // Students and recruiters can view a single job posting.
  async getJobById(jobId: string): Promise<JobDocument> {
    if (!Types.ObjectId.isValid(jobId)) {
      throw new NotFoundException('Invalid job ID.');
    }

    const job = await this.jobModel
      .findById(jobId)
      .populate('companyId', 'name logo location')
      .exec();

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    return job;
  }
}
