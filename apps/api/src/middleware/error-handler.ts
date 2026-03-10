import type { Context } from 'hono';
import type { ErrorHandler } from 'hono/types';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

interface ApiErrorLike {
  name: string;
  statusCode: number;
  code: string;
  message: string;
  toJSON(): { success: false; error: { code: string; message: string; details?: unknown } };
}

function isApiError(error: unknown): error is ApiErrorLike {
  return (
    error instanceof Error &&
    error.name === 'ApiError' &&
    'statusCode' in error &&
    'toJSON' in error &&
    typeof (error as ApiErrorLike).toJSON === 'function'
  );
}

/** 요청 메타 정보 추출 */
function getRequestMeta(c: Context) {
  return {
    method: c.req.method,
    path: c.req.path,
    ip: c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown',
  };
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/** Hono app.onError 핸들러 */
export const errorHandler: ErrorHandler = (error: Error, c: Context) => {
  const { method, path, ip } = getRequestMeta(c);

  // 커스텀 ApiError
  if (isApiError(error)) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        type: 'API_ERROR',
        method,
        path,
        ip,
        status: error.statusCode,
        code: error.code,
        message: error.message,
      }),
    );
    return c.json(error.toJSON(), error.statusCode as 400);
  }

  // Zod 검증 에러
  if (error instanceof ZodError) {
    const issues = error.issues.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    console.warn(
      JSON.stringify({
        level: 'warn',
        type: 'VALIDATION_ERROR',
        method,
        path,
        ip,
        issues,
      }),
    );
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: '입력값이 유효하지 않습니다.',
          details: issues,
        },
      },
      400,
    );
  }

  // Hono HTTPException
  if (error instanceof HTTPException) {
    const status = error.status;
    console.warn(
      JSON.stringify({
        level: 'warn',
        type: 'HTTP_EXCEPTION',
        method,
        path,
        ip,
        status,
        message: error.message,
      }),
    );
    return c.json(
      {
        success: false,
        error: {
          code: 'REQUEST_ERROR',
          message: error.message,
        },
      },
      status,
    );
  }

  // 예상치 못한 에러 (500)
  console.error(
    JSON.stringify({
      level: 'error',
      type: 'UNHANDLED_ERROR',
      method,
      path,
      ip,
      message: error.message,
      ...(IS_PRODUCTION ? {} : { stack: error.stack }),
    }),
  );

  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: IS_PRODUCTION ? '서버 오류가 발생했습니다.' : error.message,
      },
    },
    500,
  );
};
