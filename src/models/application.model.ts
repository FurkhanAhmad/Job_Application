import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type ApplicationDocument = Application & Document;

export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true })
  job!: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  applicant!: Types.ObjectId;

  @Prop({
    type: String,
    enum: ApplicationStatus,
    default: 'pending',
  })
  status!: ApplicationStatus;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
