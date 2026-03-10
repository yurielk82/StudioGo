import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/auth';

test.describe('운영자 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, 'operator');
  });

  test('운영자 대시보드 통계 표시', async ({ page }) => {
    await expect(page.getByText(/예약|오늘/)).toBeVisible();
  });

  test('예약 관리 페이지 접근', async ({ page }) => {
    await page.getByRole('link', { name: /예약/ }).click();
    await expect(page).toHaveURL(/\/operator\/reservations/);
  });

  test('모바일 뷰포트에서 반응형 레이아웃', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/operator');
    // 모바일에서 페이지 로드 확인
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
  });
});
