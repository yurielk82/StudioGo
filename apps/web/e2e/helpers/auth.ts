import { type Page } from '@playwright/test';

const API_BASE = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3001/api';

type Role = 'member' | 'operator' | 'admin';

/**
 * dev-login 엔드포인트로 토큰 발급 → localStorage에 주입
 */
export async function loginAs(page: Page, role: Role): Promise<void> {
  const response = await page.request.get(`${API_BASE}/auth/dev-login/${role}`);
  const body = await response.json();
  const { accessToken, refreshToken } = body.data.tokens;

  await page.goto('/login');
  await page.evaluate(
    ({ access, refresh }) => {
      localStorage.setItem('studiogo_access_token', access);
      localStorage.setItem('studiogo_refresh_token', refresh);
    },
    { access: accessToken, refresh: refreshToken },
  );
}

/**
 * 로그인 후 역할별 대시보드로 이동
 */
export async function loginAndNavigate(page: Page, role: Role): Promise<void> {
  await loginAs(page, role);
  const dashboardPath = role === 'admin' ? '/admin' : role === 'operator' ? '/operator' : '/member';
  await page.goto(dashboardPath);
  await page.waitForLoadState('networkidle');
}
