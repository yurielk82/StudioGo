import { tokenStorage } from './token-storage';
import { API_ROUTES } from '@/constants/api';

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

const REQUEST_TIMEOUT_MS = 15_000;

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * 토큰 갱신 — 동시 호출 방지 (단일 Promise 공유)
 */
async function refreshTokens(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(API_ROUTES.AUTH.REFRESH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = (await response.json()) as {
        success: true;
        data: { accessToken: string; refreshToken: string };
      };
      tokenStorage.setAccessToken(data.data.accessToken);
      tokenStorage.setRefreshToken(data.data.refreshToken);
      return true;
    } catch (err) {
      console.error('[토큰 갱신 실패]', err);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * API 클라이언트 — JWT 자동 첨부, 토큰 갱신 인터셉터, 타임아웃
 */
export async function apiClient<T>(url: string, options: RequestInit = {}): Promise<T> {
  const accessToken = tokenStorage.getAccessToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    // 401 → 토큰 갱신 후 1회 재시도
    if (response.status === 401 && accessToken) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        const newToken = tokenStorage.getAccessToken();
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });
        if (retryResponse.ok) {
          if (retryResponse.status === 204) return undefined as T;
          const data = (await retryResponse.json()) as { success: true; data: T };
          return data.data;
        }
      }
      // 갱신 실패 → 로그아웃
      tokenStorage.clearAll();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
      throw new ApiClientError(
        response.status,
        body?.error?.code ?? 'UNKNOWN_ERROR',
        body?.error?.message ?? `HTTP ${response.status}`,
        body?.error?.details,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const data = (await response.json()) as { success: true; data: T };
    return data.data;
  } finally {
    clearTimeout(timeoutId);
  }
}
