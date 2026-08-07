import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from 'src/models/profile.model';
import { User, UserDocument } from 'src/models/user.model';
import { CreateProfileDto } from './dto/create-profile';
import { UpdateProfileDto } from './dto/update-profile';
import { UploadService } from 'src/common/uploads/upload.service';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly uploadService: UploadService,
  ) {}

  async getMyProfile(userId: string): Promise<Record<string, unknown>> {
    const profile = await this.profileModel
      .findOne({ user: userId })
      .populate('user', 'fullname email phoneNumber role')
      .populate('company')
      .exec();

    if (!profile) {
      throw new NotFoundException('Profile not found for this user');
    }

    const profileData = profile.toObject() as unknown as Record<
      string,
      unknown
    >;
    const profilePhoto = profileData.profilePhoto as string | undefined;
    const resume = profileData.resume as string | undefined;

    if (profilePhoto) {
      profileData.profilePhoto =
        await this.uploadService.getDownloadUrl(profilePhoto);
    }

    if (resume) {
      profileData.resume = await this.uploadService.getDownloadUrl(resume);
    }

    return profileData;
  }

  async createProfile(
    createProfileDto: CreateProfileDto,
    userId: string,
    files: {
      profilePhoto?: Express.Multer.File[];
      resume?: Express.Multer.File[];
    } = {},
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

    const profilePhotoKey = files.profilePhoto?.[0]
      ? await this.uploadService.uploadProfileFile(
          files.profilePhoto[0],
          userId,
          'profile-photo',
        )
      : undefined;
    const resumeKey = files.resume?.[0]
      ? await this.uploadService.uploadProfileFile(
          files.resume[0],
          userId,
          'resume',
        )
      : undefined;

    const profile = await this.profileModel.create({
      ...createProfileDto,
      user: user._id,
      profilePhoto: profilePhotoKey,
      resume: resumeKey,
      resumeOriginalName: files.resume?.[0]?.originalname,
    });

    await this.userModel.findByIdAndUpdate(user._id, {
      profile: profile._id,
    });

    return profile;
  }

  async updateProfile(
    updateProfileDto: UpdateProfileDto,
    userId: string,
    files: {
      profilePhoto?: Express.Multer.File[];
      resume?: Express.Multer.File[];
    } = {},
  ): Promise<Record<string, unknown>> {
    const profile = await this.profileModel.findOne({ user: userId }).exec();

    if (!profile) {
      throw new NotFoundException('Profile not found for this user');
    }

    const oldProfilePhotoKey = profile.profilePhoto;
    const oldResumeKey = profile.resume;
    const newProfilePhotoKey = files.profilePhoto?.[0]
      ? await this.uploadService.uploadProfileFile(
          files.profilePhoto[0],
          userId,
          'profile-photo',
        )
      : undefined;
    const newResumeKey = files.resume?.[0]
      ? await this.uploadService.uploadProfileFile(
          files.resume[0],
          userId,
          'resume',
        )
      : undefined;

    const updates: Record<string, unknown> = { ...updateProfileDto };

    if (newProfilePhotoKey) {
      updates.profilePhoto = newProfilePhotoKey;
    }

    if (newResumeKey) {
      updates.resume = newResumeKey;
      updates.resumeOriginalName = files.resume?.[0]?.originalname;
    }

    try {
      await this.profileModel
        .findOneAndUpdate(
          { user: userId },
          { $set: updates },
          {
            new: true,
            runValidators: true,
          },
        )
        .exec();
    } catch (error) {
      await Promise.all([
        this.uploadService.deleteFile(newProfilePhotoKey),
        this.uploadService.deleteFile(newResumeKey),
      ]);
      throw error;
    }

    if (newProfilePhotoKey) {
      await this.uploadService.deleteFile(oldProfilePhotoKey);
    }

    if (newResumeKey) {
      await this.uploadService.deleteFile(oldResumeKey);
    }

    return this.getMyProfile(userId);
  }
}
