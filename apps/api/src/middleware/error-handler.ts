import type { Context, Next } from 'hono';
import { ApiError } from '../lib/api-error';
import { ZodError } from 'zod';

export async function errorHandler(c: Context, next: Next): Promise<Response | void> {
  try {
    await next();
  } catch (error) {
    if (error instanceof ApiError) {
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
  }
}
