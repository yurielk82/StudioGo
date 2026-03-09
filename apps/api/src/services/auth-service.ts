import { createAccessToken, createRefreshToken, getRefreshExpiresAt } from '../lib/jwt';
import { userRepository } from '../repositories/user-repository';
import { sessionRepository } from '../repositories/session-repository';
import { notificationRepository } from '../repositories/notification-repository';
import { ApiError } from '../lib/api-error';
import type { SignupRequest, LoginResponse } from '../../../../shared/contracts';

const KAKAO_USER_INFO_URL = 'https://kapi.kakao.com/v2/user/me';
const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';

interface KakaoUserInfo {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

async function fetchKakaoUserInfo(accessToken: string): Promise<KakaoUserInfo> {
  const response = await fetch(KAKAO_USER_INFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw ApiError.unauthorized('AUTH_KAKAO_FAILED', '카카오 인증에 실패했습니다.');
  }

  return response.json() as Promise<KakaoUserInfo>;
}

async function exchangeKakaoCode(code: string, redirectUri: string): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: process.env.KAKAO_REST_API_KEY ?? '',
    client_secret: process.env.KAKAO_CLIENT_SECRET ?? '',
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch(KAKAO_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw ApiError.unauthorized('AUTH_KAKAO_FAILED', '카카오 토큰 교환에 실패했습니다.');
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

function hashRefreshToken(token: string): string {
  // 간단한 해시 — production에서는 crypto.subtle 또는 bcrypt 사용
  // 현재는 base64로 처리 (추후 교체)
  return Buffer.from(token).toString('base64');
}

export const authService = {
  /** 카카오 네이티브 로그인 (access token 직접 전달) */
  async loginWithKakaoToken(
    kakaoAccessToken: string,
    meta: { deviceName?: string; platform?: string; ipAddress?: string; userAgent?: string },
  ) {
    const kakaoUser = await fetchKakaoUserInfo(kakaoAccessToken);
    return processKakaoLogin(kakaoUser, meta);
  },

  /** 카카오 웹 OAuth 콜백 (authorization code 전달) */
  async loginWithKakaoCode(
    code: string,
    redirectUri: string,
    meta: { deviceName?: string; platform?: string; ipAddress?: string; userAgent?: string },
  ) {
    const accessToken = await exchangeKakaoCode(code, redirectUri);
    const kakaoUser = await fetchKakaoUserInfo(accessToken);
    return processKakaoLogin(kakaoUser, meta);
  },

  /** 회원가입 추가정보 입력 */
  async signup(userId: string, data: SignupRequest) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('MEMBER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
    }

    const nicknameTaken = await userRepository.isNicknameTaken(data.nickname, userId);
    if (nicknameTaken) {
      throw ApiError.conflict('MEMBER_NICKNAME_TAKEN', '이미 사용 중인 닉네임입니다.');
    }

    const updated = await userRepository.updateSignup(userId, data);

    // 회원가입 알림 이벤트
    await notificationRepository.createJob({
      eventType: 'MEMBER_REGISTERED',
      payload: {
        userId: updated.id,
        userName: updated.name,
        userNickname: updated.nickname,
      },
      idempotencyKey: `member_registered_${updated.id}`,
    });

    return updated;
  },

  /** 토큰 갱신 */
  async refreshToken(refreshToken: string) {
    // refresh token 검증
    let payload;
    try {
      const { payload: verified } = await import('../lib/jwt').then((m) =>
        m.verifyToken(refreshToken),
      );
      payload = verified;
    } catch {
      throw ApiError.unauthorized('AUTH_TOKEN_EXPIRED', '토큰이 만료되었습니다.');
    }

    const userId = payload.sub as string;
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('MEMBER_NOT_FOUND', '사용자를 찾을 수 없습니다.');

    // 새 토큰 발급
    const tokenPayload = {
      userId: user.id,
      role: user.role,
      status: user.status,
      tier: user.tier,
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      createAccessToken(tokenPayload),
      createRefreshToken(tokenPayload),
    ]);

    return {
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
      },
    };
  },

  /** 로그아웃 */
  async logout(sessionId: string) {
    await sessionRepository.revoke(sessionId);
  },

  /** 내 세션 목록 */
  async getSessions(userId: string) {
    return sessionRepository.findByUserId(userId);
  },

  /** 개발용 로그인 — kakaoId로 시드 유저 직접 조회 후 JWT 발급 */
  async devLogin(
    kakaoId: string,
    meta: { platform?: string; ipAddress?: string; userAgent?: string },
  ): Promise<LoginResponse & { sessionId: string }> {
    const user = await userRepository.findByKakaoId(kakaoId);
    if (!user) {
      throw ApiError.notFound('MEMBER_NOT_FOUND', '개발용 테스트 유저를 찾을 수 없습니다.');
    }

    await userRepository.updateLastLogin(user.id);

    const tokenPayload = {
      userId: user.id,
      role: user.role,
      status: user.status,
      tier: user.tier,
    };

    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken(tokenPayload),
      createRefreshToken(tokenPayload),
    ]);

    const session = await sessionRepository.create({
      userId: user.id,
      refreshTokenHash: hashRefreshToken(refreshToken),
      platform: meta.platform,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      expiresAt: getRefreshExpiresAt(),
    });

    return {
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
      user: {
        id: user.id,
        kakaoId: user.kakaoId,
        email: user.email,
        name: user.name ?? '',
        nickname: user.nickname ?? '',
        phone: user.phone ?? '',
        profileImage: user.profileImage,
        tier: user.tier,
        role: user.role,
        status: user.status,
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        accountHolder: user.accountHolder,
        createdAt: user.createdAt.toISOString(),
      },
      isNewUser: false,
      sessionId: session.id,
    };
  },

  /** 현재 사용자 프로필 조회 (DB 기반) */
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('MEMBER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
    }

    return {
      id: user.id,
      kakaoId: user.kakaoId,
      email: user.email,
      name: user.name ?? '',
      nickname: user.nickname ?? '',
      phone: user.phone ?? '',
      profileImage: user.profileImage,
      tier: user.tier,
      role: user.role,
      status: user.status,
      bankName: user.bankName,
      accountNumber: user.accountNumber,
      accountHolder: user.accountHolder,
      createdAt: user.createdAt.toISOString(),
    };
  },

  /** 세션 해제 */
  async revokeSession(sessionId: string, userId: string) {
    const session = await sessionRepository.findById(sessionId);
    if (!session) throw ApiError.notFound('GENERAL_NOT_FOUND', '세션을 찾을 수 없습니다.');
    if (session.userId !== userId) {
      throw ApiError.forbidden('PERMISSION_DENIED', '본인의 세션만 해제할 수 있습니다.');
    }
    await sessionRepository.revoke(sessionId);
  },
};

async function processKakaoLogin(
  kakaoUser: KakaoUserInfo,
  meta: { deviceName?: string; platform?: string; ipAddress?: string; userAgent?: string },
): Promise<LoginResponse & { sessionId: string }> {
  const kakaoId = String(kakaoUser.id);
  const email = kakaoUser.kakao_account?.email ?? null;
  const profileImage = kakaoUser.kakao_account?.profile?.profile_image_url ?? null;

  let user = await userRepository.findByKakaoId(kakaoId);
  let isNewUser = false;

  if (!user) {
    user = await userRepository.create({
      kakaoId,
      email,
      profileImage,
    });
    isNewUser = true;
  }

  await userRepository.updateLastLogin(user.id);

  // JWT 생성
  const tokenPayload = {
    userId: user.id,
    role: user.role,
    status: user.status,
    tier: user.tier,
  };

  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken(tokenPayload),
    createRefreshToken(tokenPayload),
  ]);

  // 세션 생성
  const session = await sessionRepository.create({
    userId: user.id,
    refreshTokenHash: hashRefreshToken(refreshToken),
    deviceName: meta.deviceName,
    platform: meta.platform,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    expiresAt: getRefreshExpiresAt(),
  });

  return {
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15분
    },
    user: {
      id: user.id,
      kakaoId: user.kakaoId,
      email: user.email,
      name: user.name ?? '',
      nickname: user.nickname ?? '',
      phone: user.phone ?? '',
      profileImage: user.profileImage,
      tier: user.tier,
      role: user.role,
      status: user.status,
      bankName: user.bankName,
      accountNumber: user.accountNumber,
      accountHolder: user.accountHolder,
      createdAt: user.createdAt.toISOString(),
    },
    isNewUser,
    sessionId: session.id,
  };
}
