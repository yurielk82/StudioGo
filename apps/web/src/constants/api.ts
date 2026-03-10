/**
 * API 경로 상수 — shared/constants/api.ts 단일 소스에서 생성
 */

import { createApiRoutes, QUERY_KEYS } from '@constants/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const API_ROUTES = createApiRoutes(API_BASE);
export { QUERY_KEYS };
