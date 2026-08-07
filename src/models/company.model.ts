import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from './user.model';

import mongoose from 'mongoose';
export type CompanyDocument = Company & Document;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  website!: string;

  @Prop({ required: true })
  location!: string;

  @Prop({})
  logo?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId!: User;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
