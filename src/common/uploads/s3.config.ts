import { S3Client } from '@aws-sdk/client-s3';

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is missing from the environment`);
  }

  return value;
}

function firstEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }

  throw new Error(`${names.join(' or ')} is missing from the environment`);
}

export function createS3Client(): S3Client {
  return new S3Client({
    region: firstEnv('AWS_REGION', 'AWS_DEFAULT_REGION'),
    credentials: {
      accessKeyId: firstEnv('AWS_ACCESS_KEY_ID', 'AWS_ACCESS_KEY'),
      secretAccessKey: firstEnv(
        'AWS_SECRET_ACCESS_KEY',
        'AWS_SECRET_KEY',
      ),
    },
  });
}

export function getS3BucketName(): string {
  return (
    process.env.AWS_S3_BUCKET_NAME?.trim() ||
    process.env.AWS_S3_BUCKET?.trim() ||
    process.env.AWS_BUCKET_NAME?.trim() ||
    requiredEnv('AWS_S3_BUCKET_NAME')
  );
}
