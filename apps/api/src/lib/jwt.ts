import { SignJWT, jwtVerify } from 'jose';
import type { UserRole, Tier, UserStatus } from '@studiogo/shared/contracts';

interface TokenPayload {
  userId: string;
  role: UserRole;
  status: UserStatus;
  tier: Tier;
}

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.');
  return new TextEncoder().encode(secret);
};

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60; // 기본 15분

  const [, value, unit] = match;
  const num = Number(value);
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return num * (multipliers[unit!] ?? 60);
}

export async function createAccessToken(payload: TokenPayload): Promise<string> {
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';

  return new SignJWT({
    role: payload.role,
    status: payload.status,
    tier: payload.tier,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${parseDuration(expiresIn)}s`)
    .sign(getSecret());
}

export async function createRefreshToken(payload: TokenPayload): Promise<string> {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${parseDuration(expiresIn)}s`)
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  return jwtVerify(token, getSecret());
}

export function getRefreshExpiresAt(): Date {
  const duration = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
  const seconds = parseDuration(duration);
  return new Date(Date.now() + seconds * 1000);
}
