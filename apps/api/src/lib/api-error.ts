import type { ErrorCode } from '@studiogo/shared/contracts';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(code: string, message: string, details?: unknown) {
    return new ApiError(400, code, message, details);
  }

  static unauthorized(code: string, message: string) {
    return new ApiError(401, code, message);
  }

  static forbidden(code: string, message: string) {
    return new ApiError(403, code, message);
  }

  static notFound(code: string, message: string) {
    return new ApiError(404, code, message);
  }

  static conflict(code: string, message: string, details?: unknown) {
    return new ApiError(409, code, message, details);
  }

  static tooManyRequests(message = '요청이 너무 많습니다. 잠시 후 다시 시도하세요.') {
    return new ApiError(429, 'RATE_LIMITED', message);
  }

  static internal(message = '서버 오류가 발생했습니다.') {
    return new ApiError(500, 'INTERNAL_ERROR', message);
  }

  toJSON() {
    return {
      success: false as const,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ? { details: this.details } : {}),
      },
    };
  }
}
