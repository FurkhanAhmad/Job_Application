import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Company } from './company.model';
import { User } from './user.model';

import { Schema } from '@nestjs/mongoose';
import { Application } from './application.model';

export type JobDocument = Job & Document;
export enum JobType {
  FULL_TIME = 'Full Time',
  PART_TIME = 'Part Time',
  INTERNSHIP = 'Internship',
  CONTRACT = 'Contract',
}
@Schema({ timestamps: true })
export class Job {
  @Prop()
  title!: string;

  @Prop()
  description!: string;

  @Prop({ type: [String], default: [] })
  requirements!: string[];

  @Prop()
  salary!: number;

  @Prop()
  location!: string;

  @Prop()
  jobType!: JobType;

  @Prop()
  position!: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  })
  company!: Company;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  created_by!: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Application' })
  applications!: Application[];
}

export const JobSchema = SchemaFactory.createForClass(Job);
