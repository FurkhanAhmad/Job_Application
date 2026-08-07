import { Module } from '@nestjs/common';
import { UserProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { Profile, ProfileSchema } from 'src/models/profile.model';
import { Company, CompanySchema } from 'src/models/company.model';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Profile.name, schema: ProfileSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
    UsersModule,
  ],
  providers: [UserProfileService],
  controllers: [ProfileController],
  exports: [UserProfileService],
})
export class ProfileModule {}
