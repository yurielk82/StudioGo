import { Hono } from 'hono';
import { authService } from '../services/auth-service';
import { requireAuth, getAuthUser } from '../middleware/auth';
import { success, created } from '../lib/response';
import {
  KakaoLoginRequestSchema,
  KakaoCallbackRequestSchema,
  SignupRequestSchema,
} from '../../../../shared/contracts/schemas/auth';

const auth = new Hono();

// POST /auth/kakao — 네이티브 카카오 로그인
auth.post('/kakao', async (c) => {
  const body = KakaoLoginRequestSchema.parse(await c.req.json());

  const result = await authService.loginWithKakaoToken(body.accessToken, {
    platform: body.platform,
    ipAddress: c.req.header('x-forwarded-for') ?? '',
    userAgent: c.req.header('user-agent') ?? '',
  });

  return success(c, result);
});

// POST /auth/kakao/callback — 웹 OAuth 콜백
auth.post('/kakao/callback', async (c) => {
  const body = KakaoCallbackRequestSchema.parse(await c.req.json());

  const result = await authService.loginWithKakaoCode(body.code, body.redirectUri, {
    platform: 'WEB',
    ipAddress: c.req.header('x-forwarded-for') ?? '',
    userAgent: c.req.header('user-agent') ?? '',
  });

  return success(c, result);
});

// POST /auth/signup — 추가정보 입력
auth.post('/signup', requireAuth, async (c) => {
  const user = getAuthUser(c);
  const body = SignupRequestSchema.parse(await c.req.json());

  const result = await authService.signup(user.userId, body);
  return created(c, result);
});

// GET /auth/me — 내 정보
auth.get('/me', requireAuth, async (c) => {
  const user = getAuthUser(c);
  return success(c, user);
});

// POST /auth/logout — 로그아웃
auth.post('/logout', requireAuth, async (c) => {
  // sessionId는 JWT payload에서 추출하거나 별도 전달
  // 현재는 간소화
  return success(c, { message: '로그아웃 완료' });
});

// GET /auth/sessions — 내 세션 목록
auth.get('/sessions', requireAuth, async (c) => {
  const user = getAuthUser(c);
  const sessions = await authService.getSessions(user.userId);
  return success(c, sessions);
});

export default auth;
