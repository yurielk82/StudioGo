import type { Context } from 'hono';
import type { ErrorHandler } from 'hono/types';
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

/** Hono app.onError 핸들러 */
export const errorHandler: ErrorHandler = (error: Error, c: Context) => {
  if (isApiError(error)) {
    return c.json(error.toJSON(), error.statusCode as 400);
  }

  if (error instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: '입력값이 유효하지 않습니다.',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
      },
      400,
    );
  }

  console.error('Unhandled error:', error);

  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다.',
      },
    },
    500,
  );
};
