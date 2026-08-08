import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Application, ApplicationSchema } from 'src/models/application.model';
import { Job, JobSchema } from 'src/models/job.model';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
      { name: Job.name, schema: JobSchema },
    ]),
  ],
  providers: [ApplicationService],
  controllers: [ApplicationController],
  exports: [ApplicationService],
})
export class ApplicationModule {}
