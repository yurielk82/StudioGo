import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/auth';

test.describe('인증 플로우', () => {
  test('비로그인 사용자가 /member 접근 시 /login으로 리다이렉트', async ({ page }) => {
    await page.goto('/member');
    await expect(page).toHaveURL(/\/login/);
  });

  test('셀러(member) dev-login → /member 대시보드 진입', async ({ page }) => {
    await loginAndNavigate(page, 'member');
    await expect(page.getByRole('heading', { level: 2 })).toContainText(/대시보드|홈/);
  });

  test('운영자(operator) dev-login → /operator 대시보드 진입', async ({ page }) => {
    await loginAndNavigate(page, 'operator');
    await expect(page.getByRole('heading', { level: 2 })).toContainText(/운영/);
  });

  test('관리자(admin) dev-login → /admin 대시보드 진입', async ({ page }) => {
    await loginAndNavigate(page, 'admin');
    await expect(page.getByRole('heading', { level: 2 })).toContainText(/관리자/);
  });

  test('로그아웃 시 /login으로 이동', async ({ page }) => {
    await loginAndNavigate(page, 'member');
    await page.getByRole('button', { name: /로그아웃/ }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
