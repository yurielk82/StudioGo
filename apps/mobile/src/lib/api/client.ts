import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEY_ACCESS = 'studiogo_access_token';
const STORAGE_KEY_REFRESH = 'studiogo_refresh_token';

/**
 * 토큰 저장 — 네이티브: SecureStore, 웹: localStorage
 */
async function getToken(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setToken(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeToken(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const tokenStorage = {
  getAccessToken: () => getToken(STORAGE_KEY_ACCESS),
  setAccessToken: (token: string) => setToken(STORAGE_KEY_ACCESS, token),
  getRefreshToken: () => getToken(STORAGE_KEY_REFRESH),
  setRefreshToken: (token: string) => setToken(STORAGE_KEY_REFRESH, token),
  clearAll: async () => {
    await removeToken(STORAGE_KEY_ACCESS);
    await removeToken(STORAGE_KEY_REFRESH);
  },
};

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

/**
 * API 클라이언트 — JWT 자동 첨부, 에러 변환, 타임아웃
 */
export async function apiClient<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = await tokenStorage.getAccessToken();
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

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
      throw new ApiClientError(
        response.status,
        body?.error?.code ?? 'UNKNOWN_ERROR',
        body?.error?.message ?? `HTTP ${response.status}`,
        body?.error?.details,
      );
    }

    // 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    const data = (await response.json()) as { success: true; data: T };
    return data.data;
  } finally {
    clearTimeout(timeoutId);
  }
}
