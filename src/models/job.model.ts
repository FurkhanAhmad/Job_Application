import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type JobDocument = Job & Document;

export enum JobType {
  FULL_TIME = 'Full Time',
  PART_TIME = 'Part Time',
  INTERNSHIP = 'Internship',
  CONTRACT = 'Contract',
}

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ type: [String], default: [] })
  requirements!: string[];

  @Prop({ required: true, min: 0 })
  salary!: number;

  @Prop({ required: true, trim: true })
  location!: string;

  @Prop({ required: true, enum: JobType })
  jobType!: JobType;

  @Prop({ required: true, min: 0 })
  experience!: number;

  @Prop({ required: true, min: 1 })
  position!: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  companyId!: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  created_by!: Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    default: [],
  })
  applications!: Types.ObjectId[];
}

export const JobSchema = SchemaFactory.createForClass(Job);
