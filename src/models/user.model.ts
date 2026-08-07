import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  RECRUITER = 'recruiter',
  STUDENT = 'student',
}

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  })
  fullname!: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  email!: string;

  @Prop({
    required: true,
    trim: true,
  })
  phoneNumber!: string;

  @Prop({
    required: true,
    select: false,
  })
  password!: string;

  @Prop({
    required: true,
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  @Prop({ select: false })
  refreshToken?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
  })
  profile!: mongoose.Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Passwords must never be stored in plaintext. The hook also avoids hashing an
// already hashed password when a user document is updated for another reason.
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const bcrypt = await import('bcryptjs');
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.index({ role: 1 });
