import { z, type ZodType } from 'zod';

// ── API 응답 표준 ──────────────────────────────

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

// 제네릭 응답 타입 (런타임 검증은 각 엔드포인트에서)
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Zod 기반 응답 스키마 팩토리
export function createSuccessSchema<T extends ZodType>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: PaginationMetaSchema.optional(),
  });
}

export function createErrorSchema() {
  return z.object({
    success: z.literal(false),
    error: ApiErrorSchema,
  });
}

// ── 페이지네이션 요청 ──────────────────────────

export const PaginationRequestSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type PaginationRequest = z.infer<typeof PaginationRequestSchema>;

// ── 날짜 범위 필터 ──────────────────────────────

export const DateRangeSchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
});
export type DateRange = z.infer<typeof DateRangeSchema>;

// ── 공통 ID 파라미터 ──────────────────────────────

export const IdParamSchema = z.object({
  id: z.string().uuid(),
});
export type IdParam = z.infer<typeof IdParamSchema>;
