import type { Context } from 'hono';
import type { PaginationMeta } from '@studiogo/shared/contracts';

export function success<T>(c: Context, data: T, meta?: PaginationMeta) {
  return c.json({
    success: true as const,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function created<T>(c: Context, data: T) {
  return c.json(
    {
      success: true as const,
      data,
    },
    201,
  );
}

export function noContent(c: Context) {
  return c.body(null, 204);
}

export function paginated<T>(
  c: Context,
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  const totalPages = Math.ceil(total / limit);
  return c.json({
    success: true as const,
    data,
    meta: { page, limit, total, totalPages },
  });
}
