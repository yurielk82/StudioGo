import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { ApiError } from '../lib/api-error';
import { systemLogRepository } from '../repositories/system-log-repository';
import { env } from '../lib/env';

const UPLOAD_URL_EXPIRY_SECONDS = 300;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function createS3Client(): S3Client | null {
  if (!env.S3_BUCKET_NAME || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
    return null;
  }

  return new S3Client({
    region: env.S3_REGION ?? 'auto',
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    ...(env.S3_ENDPOINT ? { endpoint: env.S3_ENDPOINT, forcePathStyle: true } : {}),
  });
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = createS3Client();
  }
  if (!s3Client) {
    throw ApiError.internal('스토리지 설정이 완료되지 않았습니다. S3/R2 환경변수를 확인하세요.');
  }
  return s3Client;
}

export const assetService = {
  /** 업로드 URL 발급 */
  async getUploadUrl(userId: string, contentType: string, fileName: string) {
    if (!ALLOWED_TYPES.includes(contentType)) {
      throw ApiError.badRequest(
        'VALIDATION_INVALID_INPUT',
        `허용되지 않는 파일 형식입니다. (${ALLOWED_TYPES.join(', ')})`,
      );
    }

    // 경로 조작 방지: basename 추출 + UUID 키 사용
    const safeName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `uploads/${userId}/${randomUUID()}_${safeName}`;
    const client = getS3Client();

    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: UPLOAD_URL_EXPIRY_SECONDS,
    });

    return {
      uploadUrl,
      key,
      expiresIn: UPLOAD_URL_EXPIRY_SECONDS,
    };
  },

  /** 업로드 확인 */
  async confirmUpload(userId: string, key: string) {
    const client = getS3Client();

    // S3/R2에서 객체 존재 확인
    const headCommand = new HeadObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
    });

    let headResult;
    try {
      headResult = await client.send(headCommand);
    } catch {
      throw ApiError.badRequest(
        'ASSET_NOT_FOUND',
        '업로드된 파일을 찾을 수 없습니다. 업로드를 다시 시도하세요.',
      );
    }

    // Content-Type 서버 검증: 실제 업로드된 파일의 타입이 허용 목록에 포함되는지 확인
    const actualContentType = headResult.ContentType ?? '';
    if (!ALLOWED_TYPES.includes(actualContentType)) {
      throw ApiError.badRequest(
        'VALIDATION_INVALID_INPUT',
        `업로드된 파일의 실제 형식(${actualContentType})이 허용되지 않습니다.`,
      );
    }

    const publicBase = env.ASSET_PUBLIC_BASE_URL ?? env.S3_ENDPOINT ?? '';
    const publicUrl = `${publicBase}/${env.S3_BUCKET_NAME}/${key}`;

    await systemLogRepository.create({
      userId,
      action: 'ASSET_UPLOAD',
      target: 'assets',
      details: { key },
    });

    return { url: publicUrl, key };
  },
};
