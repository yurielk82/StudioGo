'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient, tokenStorage, ApiClientError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { QUERY_KEYS, API_ROUTES } from '@/constants/api';
import type { LoginResponse, UserProfile, SignupRequest } from '@contracts/schemas/auth';

/**
 * 현재 사용자 정보 조회 — 앱 시작 시 토큰 유효성 검증
 */
export function useMe() {
  const { setUser, clearUser, setInitialized } = useAuthStore();

  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: async () => {
      try {
        const token = tokenStorage.getAccessToken();
        if (!token) {
          return null;
        }
        const profile = await apiClient<UserProfile>(API_ROUTES.AUTH.ME);
        setUser({
          id: profile.id,
          kakaoId: profile.kakaoId,
          nickname: profile.nickname,
          profileImageUrl: profile.profileImage,
          role: profile.role,
          status: profile.status,
          tier: profile.tier,
        });
        return profile;
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) {
          tokenStorage.clearAll();
          clearUser();
          return null;
        }
        throw err;
      } finally {
        setInitialized();
      }
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

/**
 * 카카오 웹 OAuth 콜백
 */
export function useKakaoWebLogin() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: async (params: { code: string; redirectUri: string }) => {
      const data = await apiClient<LoginResponse>(API_ROUTES.AUTH.KAKAO_CALLBACK, {
        method: 'POST',
        body: JSON.stringify(params),
      });
      return data;
    },
    onSuccess: (data) => {
      tokenStorage.setAccessToken(data.tokens.accessToken);
      tokenStorage.setRefreshToken(data.tokens.refreshToken);
      setUser({
        id: data.user.id,
        kakaoId: data.user.kakaoId,
        nickname: data.user.nickname,
        profileImageUrl: data.user.profileImage,
        role: data.user.role,
        status: data.user.status,
        tier: data.user.tier,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
    },
  });
}

/**
 * 개발용 역할별 로그인 — 시드된 테스트 유저로 JWT 발급
 */
export function useDevLogin() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: async (role: 'member' | 'operator' | 'admin' | 'pending') => {
      const data = await apiClient<LoginResponse>(API_ROUTES.AUTH.devLogin(role));
      return data;
    },
    onSuccess: (data) => {
      tokenStorage.setAccessToken(data.tokens.accessToken);
      tokenStorage.setRefreshToken(data.tokens.refreshToken);
      setUser({
        id: data.user.id,
        kakaoId: data.user.kakaoId,
        nickname: data.user.nickname,
        profileImageUrl: data.user.profileImage,
        role: data.user.role,
        status: data.user.status,
        tier: data.user.tier,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
    },
  });
}

/**
 * 회원가입 추가정보 입력
 */
export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      return apiClient<UserProfile>(API_ROUTES.AUTH.SIGNUP, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
    },
  });
}

/**
 * 로그아웃
 */
export function useLogout() {
  const router = useRouter();
  const { clearUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient(API_ROUTES.AUTH.LOGOUT, { method: 'POST' });
    },
    onSettled: () => {
      tokenStorage.clearAll();
      clearUser();
      queryClient.clear();
      router.push('/login');
    },
  });
}
