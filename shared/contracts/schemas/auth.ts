import { z } from 'zod';
import { UserRole, UserStatus, Tier, Platform } from '../enums';

// ── 카카오 로그인 ──────────────────────────────

export const KakaoLoginRequestSchema = z.object({
  accessToken: z.string().min(1),
  platform: Platform,
});
export type KakaoLoginRequest = z.infer<typeof KakaoLoginRequestSchema>;

export const KakaoCallbackRequestSchema = z.object({
  code: z.string().min(1),
  redirectUri: z.string().url(),
});
export type KakaoCallbackRequest = z.infer<typeof KakaoCallbackRequestSchema>;

// ── 회원가입 (추가정보) ──────────────────────────

export const SignupRequestSchema = z.object({
  name: z.string().min(2).max(20),
  nickname: z.string().min(2).max(20),
  phone: z.string().regex(/^01[016789]\d{7,8}$/, '유효한 전화번호를 입력하세요'),
  bankName: z.string().max(20).optional(),
  accountNumber: z.string().max(30).optional(),
  accountHolder: z.string().max(20).optional(),
});
export type SignupRequest = z.infer<typeof SignupRequestSchema>;

// ── 토큰 갱신 ──────────────────────────────────

export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;

// ── 응답 ──────────────────────────────────────

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});
export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  kakaoId: z.string(),
  email: z.string().email().nullable(),
  name: z.string(),
  nickname: z.string(),
  phone: z.string(),
  profileImage: z.string().url().nullable(),
  tier: Tier,
  role: UserRole,
  status: UserStatus,
  bankName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  accountHolder: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const LoginResponseSchema = z.object({
  tokens: AuthTokensSchema,
  user: UserProfileSchema,
  isNewUser: z.boolean(),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const SessionSchema = z.object({
  id: z.string().uuid(),
  deviceName: z.string().nullable(),
  platform: Platform.nullable(),
  lastSeenAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  isCurrent: z.boolean(),
});
export type Session = z.infer<typeof SessionSchema>;
