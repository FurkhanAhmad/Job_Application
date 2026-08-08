import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Application, ApplicationDocument } from 'src/models/application.model';
import { Job, JobDocument } from 'src/models/job.model';
import { ApplyJobDto } from './dto/apply-job.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,
  ) {}

  async applyForJob(
    applyJobDto: ApplyJobDto,
    userId: string,
  ): Promise<ApplicationDocument> {
    // The applicant comes from the authenticated user, not from the request body.
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID.');
    }

    if (!Types.ObjectId.isValid(applyJobDto.job)) {
      throw new NotFoundException('Invalid job ID.');
    }

    const jobExists = await this.jobModel.exists({ _id: applyJobDto.job });

    if (!jobExists) {
      throw new NotFoundException('Job not found.');
    }

    const alreadyApplied = await this.applicationModel.exists({
      job: applyJobDto.job,
      applicant: userId,
    });

    if (alreadyApplied) {
      throw new ConflictException('You have already applied for this job.');
    }

    const application = await this.applicationModel.create({
      job: new Types.ObjectId(applyJobDto.job),
      applicant: new Types.ObjectId(userId),
      // New applications always start with the schema default: pending.
    });

    await this.jobModel.findByIdAndUpdate(applyJobDto.job, {
      $addToSet: { applications: application._id },
    });

    return application;
  }

  async getMyApplications(userId: string): Promise<ApplicationDocument[]> {
    // Students can view only applications submitted by their own account.
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID.');
    }

    return this.applicationModel
      .find({ applicant: userId })
      .populate('job', 'title location salary jobType companyId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getMyApplicationById(
    applicationId: string,
    userId: string,
  ): Promise<ApplicationDocument> {
    // A student can read only their own application and its latest status.
    if (!Types.ObjectId.isValid(applicationId)) {
      throw new NotFoundException('Invalid application ID.');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID.');
    }

    const application = await this.applicationModel
      .findOne({ _id: applicationId, applicant: userId })
      .populate('job', 'title location salary jobType companyId')
      .exec();

    if (!application) {
      throw new NotFoundException(
        'Application not found or does not belong to you.',
      );
    }

    return application;
  }

  async getReceivedApplications(
    recruiterId: string,
  ): Promise<ApplicationDocument[]> {
    // Recruiters receive applications only for jobs created by their account.
    if (!Types.ObjectId.isValid(recruiterId)) {
      throw new NotFoundException('Invalid user ID.');
    }

    const recruiterJobs = await this.jobModel
      .find({ created_by: recruiterId })
      .select('_id')
      .lean()
      .exec();

    const jobIds = recruiterJobs.map((job) => job._id);

    return this.applicationModel
      .find({ job: { $in: jobIds } })
      .populate('job', 'title location salary jobType companyId')
      .populate({
        path: 'applicant',
        select: 'fullname email phoneNumber profile',
        populate: { path: 'profile' },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateApplicationStatus(
    applicationId: string,
    statusDto: UpdateApplicationStatusDto,
    recruiterId: string,
  ): Promise<ApplicationDocument> {
    // The ownership condition prevents a recruiter from updating another recruiter's application.
    if (!Types.ObjectId.isValid(applicationId)) {
      throw new NotFoundException('Invalid application ID.');
    }

    if (!Types.ObjectId.isValid(recruiterId)) {
      throw new NotFoundException('Invalid user ID.');
    }

    const recruiterJobs = await this.jobModel
      .find({ created_by: recruiterId })
      .select('_id')
      .lean()
      .exec();

    const jobIds = recruiterJobs.map((job) => job._id);

    const application = await this.applicationModel
      .findOneAndUpdate(
        { _id: applicationId, job: { $in: jobIds } },
        { $set: { status: statusDto.status } },
        { new: true, runValidators: true },
      )
      .populate('job', 'title location salary jobType companyId')
      .populate({
        path: 'applicant',
        select: 'fullname email phoneNumber profile',
        populate: { path: 'profile' },
      })
      .exec();

    if (!application) {
      throw new NotFoundException(
        'Application not found or does not belong to your job.',
      );
    }

    return application;
  }
}
