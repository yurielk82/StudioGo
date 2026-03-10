/**
 * API 경로 상수 — shared/constants/api.ts 단일 소스에서 생성
 */

import { createApiRoutes, QUERY_KEYS } from '@constants/api';
import { env } from '@/lib/env';

const API_BASE = env.NEXT_PUBLIC_API_URL;

export const API_ROUTES = createApiRoutes(API_BASE);
export { QUERY_KEYS };
