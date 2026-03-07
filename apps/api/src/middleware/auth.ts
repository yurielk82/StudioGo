import type { Context, Next } from 'hono';
import { jwtVerify } from 'jose';
import { ApiError } from '../lib/api-error';
import type { UserRole } from '@studiogo/shared/contracts';

// JWT payload에서 추출되는 사용자 컨텍스트
export interface AuthUser {
  userId: string;
  role: UserRole;
  status: string;
  tier: string;
}

const JWT_SECRET_KEY = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.');
  return new TextEncoder().encode(secret);
};

/** 인증 필수 미들웨어 */
export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('AUTH_INVALID_TOKEN', '인증 토큰이 필요합니다.');
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY());

    const user: AuthUser = {
      userId: payload.sub as string,
      role: payload.role as UserRole,
      status: payload.status as string,
      tier: payload.tier as string,
    };

    c.set('user', user);
    await next();
  } catch {
    throw ApiError.unauthorized('AUTH_TOKEN_EXPIRED', '인증 토큰이 만료되었습니다.');
  }
}

/** APPROVED 상태 필수 */
export async function requireApproved(c: Context, next: Next) {
  const user = getAuthUser(c);

  if (user.status === 'PENDING') {
    throw ApiError.forbidden('MEMBER_NOT_APPROVED', '회원 승인 대기 중입니다.');
  }

  if (user.status === 'SUSPENDED') {
    throw ApiError.forbidden('MEMBER_SUSPENDED', '이용이 정지된 계정입니다.');
  }

  if (user.status !== 'APPROVED') {
    throw ApiError.forbidden('AUTH_UNAUTHORIZED', '접근 권한이 없습니다.');
  }

  await next();
}

/** OPERATOR 이상 권한 필수 */
export async function requireOperator(c: Context, next: Next) {
  const user = getAuthUser(c);

  if (user.role !== 'OPERATOR' && user.role !== 'ADMIN') {
    throw ApiError.forbidden('PERMISSION_DENIED', '운영자 권한이 필요합니다.');
  }

  await next();
}

/** ADMIN 전용 */
export async function requireAdmin(c: Context, next: Next) {
  const user = getAuthUser(c);

  if (user.role !== 'ADMIN') {
    throw ApiError.forbidden('PERMISSION_DENIED', '관리자 권한이 필요합니다.');
  }

  await next();
}

/** Context에서 AuthUser 추출 */
export function getAuthUser(c: Context): AuthUser {
  const user = c.get('user') as AuthUser | undefined;
  if (!user) {
    throw ApiError.unauthorized('AUTH_INVALID_TOKEN', '인증 정보가 없습니다.');
  }
  return user;
}

/** Cron 엔드포인트 보호 */
export async function requireCronSecret(c: Context, next: Next) {
  const secret = c.req.header('Authorization')?.replace('Bearer ', '');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || secret !== cronSecret) {
    throw ApiError.forbidden('PERMISSION_DENIED', 'Cron 접근 권한이 없습니다.');
  }

  await next();
}
