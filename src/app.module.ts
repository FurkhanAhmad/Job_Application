import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RolesGuard } from './common/guards/role.guard';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { UploadModule } from './common/uploads/upload.module';
import { CompanyModule } from './modules/company/company.module';
import { JobModule } from './modules/jobs/job.module';
import { ApplicationModule } from './modules/application/application.module';


loadEnvironment();

@Module({
  imports: [
    MongooseModule.forRoot(getMongoUri(), {
      retryAttempts: 3,
      retryDelay: 3000,
    }),
    AuthModule,
    ProfileModule,
    UploadModule,
    CompanyModule,
    JobModule,
    ApplicationModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

function getMongoUri(): string {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri) {
    throw new Error(
      'MONGODB_URI is missing. Set it to your local MongoDB or MongoDB Atlas connection string before starting the app.',
    );
  }

  return mongoUri;
}

function loadEnvironment(): void {
  try {
    process.loadEnvFile();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}
