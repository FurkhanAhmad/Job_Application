import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyModule } from '../company/company.module';
import { Job, JobSchema } from 'src/models/job.model';
import { JobController } from './job.controller';
import { JobService } from './job.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    CompanyModule,
  ],
  providers: [JobService],
  controllers: [JobController],
  exports: [JobService],
})
export class JobModule {}
