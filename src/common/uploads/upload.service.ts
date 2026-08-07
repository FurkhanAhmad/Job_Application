import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { createS3Client, getS3BucketName } from './s3.config';

export type ProfileFileType = 'profile-photo' | 'resume';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client = createS3Client();
  private readonly bucketName = getS3BucketName();

  async uploadProfileFile(
    file: Express.Multer.File,
    userId: string,
    type: ProfileFileType,
  ): Promise<string> {
    this.validateProfileFile(file, type);

    const extension = file.originalname.includes('.')
      ? file.originalname
          .substring(file.originalname.lastIndexOf('.'))
          .toLowerCase()
      : '';
    const key = `profiles/${userId}/${type}/${randomUUID()}${extension}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          Metadata: {
            originalName: encodeURIComponent(file.originalname),
          },
        }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `S3 upload failed for ${type} (${this.bucketName}/${key}): ${message}`,
      );
      throw new InternalServerErrorException('Failed to upload file to S3');
    }

    return key;
  }

  async getDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    return getSignedUrl(
      this.s3Client,
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
      { expiresIn: expiresInSeconds },
    );
  }

  async deleteFile(key?: string): Promise<void> {
    if (!key) return;

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }

  private validateProfileFile(
    file: Express.Multer.File,
    type: ProfileFileType,
  ): void {
    const allowedTypes =
      type === 'profile-photo'
        ? ['image/jpeg', 'image/png', 'image/webp']
        : ['application/pdf'];
    const maxSize =
      type === 'profile-photo' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        type === 'profile-photo'
          ? 'Profile photo must be JPG, PNG, or WEBP'
          : 'Resume must be a PDF file',
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException(
        `${type === 'profile-photo' ? 'Profile photo' : 'Resume'} is too large`,
      );
    }
  }
}
