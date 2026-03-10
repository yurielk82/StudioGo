const STORAGE_KEY_ACCESS = 'studiogo_access_token';
const STORAGE_KEY_REFRESH = 'studiogo_refresh_token';

/**
 * 토큰 저장소 — 웹 전용 (localStorage)
 */
export const tokenStorage = {
  getAccessToken: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ACCESS) : null,

  setAccessToken: (token: string): void => localStorage.setItem(STORAGE_KEY_ACCESS, token),

  getRefreshToken: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_REFRESH) : null,

  setRefreshToken: (token: string): void => localStorage.setItem(STORAGE_KEY_REFRESH, token),

  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEY_ACCESS);
    localStorage.removeItem(STORAGE_KEY_REFRESH);
  },
};
