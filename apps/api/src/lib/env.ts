import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  KAKAO_REST_API_KEY: z.string().min(1),
  KAKAO_CLIENT_SECRET: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  APP_URL: z.string().url().default('http://localhost:8081'),
  PORT: z.coerce.number().default(3001),
  // 선택적 (프로덕션에서만 필요)
  KAKAO_BIZ_APP_KEY: z.string().optional(),
  KAKAO_BIZ_SENDER_KEY: z.string().optional(),
  EXPO_ACCESS_TOKEN: z.string().optional(),
  ASSET_PUBLIC_BASE_URL: z.string().optional(),
  ASSET_UPLOAD_BASE_URL: z.string().optional(),
  ALLOW_DEV_LOGIN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('환경변수 검증 실패:');
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    // 프로덕션에서는 시작 불가
    if (process.env.NODE_ENV === 'production') {
      throw new Error('환경변수 검증 실패 — 프로덕션 시작 불가');
    }
    // 개발 환경: 스키마 기본값 적용 후 진행
    const partial = envSchema.partial().safeParse(process.env);
    return (partial.data ?? {}) as unknown as Env;
  }
  return result.data;
}

export const env = validateEnv();
