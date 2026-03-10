import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/auth';

test.describe('관리자 대시보드', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, 'admin');
  });

  test('통계 카드 4개 렌더링', async ({ page }) => {
    await expect(page.getByText('총 예약')).toBeVisible();
    await expect(page.getByText('활성 회원')).toBeVisible();
    await expect(page.getByText('평균 가동률')).toBeVisible();
    await expect(page.getByText('노쇼 / 취소율')).toBeVisible();
  });

  test('기간 필터 변경 시 데이터 갱신', async ({ page }) => {
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: '최근 7일' }).click();
    await expect(page.getByText('예약 추이 (최근 7일)')).toBeVisible();
  });

  test('사이드바 네비게이션 — 설정 페이지 이동', async ({ page }) => {
    await page.getByRole('link', { name: /설정/ }).click();
    await expect(page).toHaveURL(/\/admin\/settings/);
  });
});
