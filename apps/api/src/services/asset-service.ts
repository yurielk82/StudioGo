import { ApiError } from '../lib/api-error';
import { systemLogRepository } from '../repositories/system-log-repository';

// 간단한 presigned URL 발급 (실제 구현은 S3/R2 연동 필요)
const UPLOAD_URL_EXPIRY_SECONDS = 300;

export const assetService = {
  /** 업로드 URL 발급 */
  async getUploadUrl(userId: string, contentType: string, fileName: string) {
    // 허용 타입 검증
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED_TYPES.includes(contentType)) {
      throw ApiError.badRequest(
        'VALIDATION_INVALID_INPUT',
        `허용되지 않는 파일 형식입니다. (${ALLOWED_TYPES.join(', ')})`,
      );
    }

    const key = `uploads/${userId}/${Date.now()}_${fileName}`;

    // 실제 구현 시 S3/R2 presigned URL 생성
    // 현재는 placeholder 반환
    const uploadUrl = `${process.env.ASSET_UPLOAD_BASE_URL ?? '/assets'}/${key}`;

    return {
      uploadUrl,
      key,
      expiresIn: UPLOAD_URL_EXPIRY_SECONDS,
    };
  },

  /** 업로드 확인 */
  async confirmUpload(userId: string, key: string) {
    // 실제 구현 시 S3/R2에서 객체 존재 확인 후 assets 테이블에 기록
    const publicUrl = `${process.env.ASSET_PUBLIC_BASE_URL ?? '/assets'}/${key}`;

    await systemLogRepository.create({
      userId,
      action: 'ASSET_UPLOAD',
      target: 'assets',
      details: { key },
    });

    return { url: publicUrl, key };
  },
};
