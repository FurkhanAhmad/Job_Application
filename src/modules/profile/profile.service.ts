import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Profile, ProfileDocument } from "src/models/profile.model";
import { User, UserDocument } from 'src/models/user.model';
import { CreateProfileDto } from './dto/create-profile';


@Injectable()
export class UserProfileService {
        
    constructor(
        @InjectModel (Profile.name) private profileModel:Model<ProfileDocument>,
        @InjectModel (User.name) private userModel:Model<UserDocument>
    ){}

  async getMyProfile(userId: string): Promise<Profile> {
    const profile = await this.profileModel
      .findOne({ user: userId })
      .populate('user', 'fullname email phoneNumber role')
      .populate('company')
      .exec();

    if (!profile) {
      throw new NotFoundException('Profile not found for this user');
    }

    return profile;
  }

  async createProfile(
    createProfileDto: CreateProfileDto,
    userId: string,
  ): Promise<Profile> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingProfile = await this.profileModel
      .findOne({ user: userId })
      .exec();

    if (existingProfile) {
      throw new ConflictException('Profile already exists for this user');
    }

    const profile = await this.profileModel.create({
      ...createProfileDto,
      user: user._id,
    });

    await this.userModel.findByIdAndUpdate(user._id, {
      profile: profile._id,
    });

    return profile;
  }
}
