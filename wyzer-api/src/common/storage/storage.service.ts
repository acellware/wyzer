import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Env } from '../../config/env.schema';

@Injectable()
export class StorageService {
  private readonly client: S3Client | null;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly configured: boolean;

  constructor(private readonly config: ConfigService<Env, true>) {
    const accountId = config.get('R2_ACCOUNT_ID', { infer: true });
    const accessKeyId = config.get('R2_ACCESS_KEY_ID', { infer: true });
    const secretAccessKey = config.get('R2_SECRET_ACCESS_KEY', { infer: true });
    this.bucket = config.get('R2_BUCKET_NAME', { infer: true }) ?? '';
    this.publicUrl = config.get('R2_PUBLIC_URL', { infer: true }) ?? '';

    this.configured = !!(accountId && accessKeyId && secretAccessKey && this.bucket);

    if (this.configured) {
      this.client = new S3Client({
        // R2 uses "auto" as region — never hardcode us-east-1
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: accessKeyId!,
          secretAccessKey: secretAccessKey!,
        },
      });
    } else {
      this.client = null;
    }
  }

  /**
   * Uploads a Buffer to R2 and returns the public URL.
   * Throws if R2 is not configured.
   */
  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    if (!this.client || !this.configured) {
      throw new Error('R2 storage is not configured — set R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    // Return public URL (custom domain or r2.dev subdomain)
    return `${this.publicUrl}/${key}`;
  }

  /**
   * Generates a presigned URL for a private object (valid for 1 hour).
   */
  async presign(key: string, expiresInSeconds = 3600): Promise<string> {
    if (!this.client || !this.configured) {
      throw new Error('R2 storage is not configured');
    }

    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }

  isConfigured(): boolean {
    return this.configured;
  }
}
