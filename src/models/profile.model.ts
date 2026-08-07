import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Company } from './company.model';
import { User } from './user.model';

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })
export class Profile {
  @Prop({
    trim: true,
    maxlength: 500,
    default: '',
  })
  bio?: string;

  @Prop({
    type: [String],
    default: [],
  })
  skills?: string[];

  @Prop({
    default: '',
  })
  resume?: string;

  @Prop({
    default: '',
  })
  resumeOriginalName?: string;

  @Prop({
    default: '',
  })
  profilePhoto?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  })
  company?: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  user!: Types.ObjectId;
  
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
