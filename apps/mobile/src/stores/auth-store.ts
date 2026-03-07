import { create } from 'zustand';
import type { UserRole, UserStatus, Tier } from '@contracts/enums';

/** 인증 사용자 정보 (서버 /auth/me 응답 기반) */
interface AuthUser {
  id: string;
  kakaoId: string;
  nickname: string;
  profileImageUrl: string | null;
  role: UserRole;
  status: UserStatus;
  tier: Tier;
}

interface AuthState {
  /** 현재 로그인 사용자 (null = 비로그인) */
  user: AuthUser | null;
  /** 인증 초기화 완료 여부 */
  isInitialized: boolean;
  /** 로그인 처리 */
  setUser: (user: AuthUser) => void;
  /** 로그아웃 처리 */
  clearUser: () => void;
  /** 앱 시작 시 인증 상태 복원 완료 표시 */
  setInitialized: () => void;
}

/**
 * Zustand 인증 스토어 — UI 상태만 관리
 * 서버 상태(토큰 유효성 등)는 TanStack Query로 관리
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setInitialized: () => set({ isInitialized: true }),
}));

// 셀렉터
export const selectIsLoggedIn = (state: AuthState) => state.user !== null;
export const selectUserRole = (state: AuthState) => state.user?.role ?? null;
export const selectIsApproved = (state: AuthState) => state.user?.status === 'APPROVED';
