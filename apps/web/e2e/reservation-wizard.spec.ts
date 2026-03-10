import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/auth';

test.describe('예약 위자드', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, 'member');
  });

  test('위자드 5단계 스텝 진행 가능', async ({ page }) => {
    await page.goto('/member/reservations/new');

    // Step 1: 스튜디오 선택
    await expect(page.getByText('스튜디오 선택')).toBeVisible();
    const studioCard = page.locator('[class*="cursor-pointer"]').first();
    await studioCard.waitFor({ timeout: 10_000 });
    await studioCard.click();
    await page.getByRole('button', { name: '다음' }).click();

    // Step 2: 날짜 선택
    await expect(page.getByText('날짜 선택')).toBeVisible();
    const dateButton = page.locator('button:not([disabled])').filter({ hasText: /^\d+$/ }).first();
    await dateButton.click();
    await page.getByRole('button', { name: '다음' }).click();

    // Step 3: 시간 선택
    await expect(page.getByText('시간 선택')).toBeVisible();
  });

  test('위자드 이전 버튼으로 되돌아가기 가능', async ({ page }) => {
    await page.goto('/member/reservations/new');

    const studioCard = page.locator('[class*="cursor-pointer"]').first();
    await studioCard.waitFor({ timeout: 10_000 });
    await studioCard.click();
    await page.getByRole('button', { name: '다음' }).click();

    // 날짜 단계에서 이전
    await expect(page.getByText('날짜 선택')).toBeVisible();
    await page.getByRole('button', { name: '이전' }).click();

    // 스튜디오 단계로 복귀
    await expect(page.getByText('스튜디오 선택')).toBeVisible();
  });

  test('스텝 프로그레스 바에 현재 단계 표시', async ({ page }) => {
    await page.goto('/member/reservations/new');
    await expect(page.locator('[class*="ring-4"]')).toHaveCount(1);
  });
});
