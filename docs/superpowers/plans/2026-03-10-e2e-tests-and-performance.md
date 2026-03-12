# E2E 테스트 + 성능 최적화 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Playwright E2E 테스트로 3대 핵심 플로우 검증 + Next.js/API 성능 최적화로 프로덕션 품질 확보

**Architecture:** Playwright는 `apps/web/e2e/`에 배치하고 dev-login 엔드포인트로 인증 우회. 성능은 Next.js 설정(이미지, 번들), API 캐시 헤더, 폰트 최적화 3축으로 진행.

**Tech Stack:** Playwright, Next.js 15, @next/bundle-analyzer, Hono middleware

---

## Chunk 1: E2E 테스트 인프라 + 인증 플로우

### Task 1: Playwright 설치 및 설정

**Files:**

- Create: `apps/web/playwright.config.ts`
- Create: `apps/web/e2e/helpers/auth.ts`
- Modify: `apps/web/package.json` (scripts 추가)
- Modify: `package.json` (루트 scripts 추가)

- [ ] **Step 1: Playwright 의존성 설치**

```bash
cd /home/ubuntu/GitHub/StudioGo && npm install -D @playwright/test --workspace=apps/web
```

- [ ] **Step 2: Playwright 브라우저 설치**

```bash
npx playwright install chromium
```

- [ ] **Step 3: Playwright 설정 파일 생성**

`apps/web/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
```

- [ ] **Step 4: 인증 헬퍼 생성**

`apps/web/e2e/helpers/auth.ts`:

```typescript
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
```

- [ ] **Step 5: package.json scripts 추가**

`apps/web/package.json`에 추가:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

루트 `package.json`에 추가:

```json
{
  "scripts": {
    "test:e2e": "npm run test:e2e --workspace=apps/web"
  }
}
```

- [ ] **Step 6: 커밋**

```bash
git add apps/web/playwright.config.ts apps/web/e2e/ apps/web/package.json package.json
git commit -m "chore: Playwright E2E 테스트 인프라 구성"
```

---

### Task 2: 로그인 플로우 E2E 테스트

**Files:**

- Create: `apps/web/e2e/auth.spec.ts`

**전제조건:** API 서버가 `localhost:3001`에서 실행 중이어야 하며, `ALLOW_DEV_LOGIN=true` 설정 필요.

- [ ] **Step 1: 로그인 테스트 작성**

`apps/web/e2e/auth.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { loginAs, loginAndNavigate } from './helpers/auth';

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
    // 셀러 대시보드에서 로그아웃 버튼 클릭
    await page.getByRole('button', { name: /로그아웃/ }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
```

- [ ] **Step 2: 로컬에서 API + 웹 실행 후 테스트**

```bash
# 터미널 1: API + 웹 실행
npm run dev:all
# 터미널 2: E2E 테스트
cd apps/web && npx playwright test auth.spec.ts --project=chromium
```

Expected: 5개 테스트 통과

- [ ] **Step 3: 커밋**

```bash
git add apps/web/e2e/auth.spec.ts
git commit -m "test: 인증 플로우 E2E 테스트 5개"
```

---

### Task 3: 셀러 예약 위자드 E2E 테스트

**Files:**

- Create: `apps/web/e2e/reservation-wizard.spec.ts`

- [ ] **Step 1: 예약 위자드 테스트 작성**

`apps/web/e2e/reservation-wizard.spec.ts`:

```typescript
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
    // 스튜디오 목록 로드 대기
    const studioCard = page.locator('[class*="cursor-pointer"]').first();
    await studioCard.waitFor({ timeout: 10_000 });
    await studioCard.click();
    await page.getByRole('button', { name: '다음' }).click();

    // Step 2: 날짜 선택
    await expect(page.getByText('날짜 선택')).toBeVisible();
    // 오늘 이후 첫 번째 활성 날짜 클릭
    const dateButton = page.locator('button:not([disabled])').filter({ hasText: /^\d+$/ }).first();
    await dateButton.click();
    await page.getByRole('button', { name: '다음' }).click();

    // Step 3: 시간 선택
    await expect(page.getByText('시간 선택')).toBeVisible();
  });

  test('위자드 이전 버튼으로 되돌아가기 가능', async ({ page }) => {
    await page.goto('/member/reservations/new');
    // 스튜디오 선택 후 다음
    const studioCard = page.locator('[class*="cursor-pointer"]').first();
    await studioCard.waitFor({ timeout: 10_000 });
    await studioCard.click();
    await page.getByRole('button', { name: '다음' }).click();

    // 날짜 단계에서 이전 클릭
    await expect(page.getByText('날짜 선택')).toBeVisible();
    await page.getByRole('button', { name: '이전' }).click();

    // 스튜디오 선택 단계로 복귀
    await expect(page.getByText('스튜디오 선택')).toBeVisible();
  });

  test('스텝 프로그레스 바에 현재 단계 표시', async ({ page }) => {
    await page.goto('/member/reservations/new');
    // ring-4 클래스가 있는 활성 스텝 확인
    await expect(page.locator('[class*="ring-4"]')).toHaveCount(1);
  });
});
```

- [ ] **Step 2: 테스트 실행**

```bash
cd apps/web && npx playwright test reservation-wizard.spec.ts --project=chromium
```

Expected: 3개 테스트 통과

- [ ] **Step 3: 커밋**

```bash
git add apps/web/e2e/reservation-wizard.spec.ts
git commit -m "test: 예약 위자드 E2E 테스트 3개"
```

---

### Task 4: 관리자 대시보드 E2E 테스트

**Files:**

- Create: `apps/web/e2e/admin-dashboard.spec.ts`

- [ ] **Step 1: 관리자 대시보드 테스트 작성**

`apps/web/e2e/admin-dashboard.spec.ts`:

```typescript
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
    // 기본값 '최근 30일' → '최근 7일' 변경
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: '최근 7일' }).click();
    // 차트 제목에 기간 반영
    await expect(page.getByText('예약 추이 (최근 7일)')).toBeVisible();
  });

  test('사이드바 네비게이션 — 설정 페이지 이동', async ({ page }) => {
    await page.getByRole('link', { name: /설정/ }).click();
    await expect(page).toHaveURL(/\/admin\/settings/);
  });
});
```

- [ ] **Step 2: 테스트 실행**

```bash
cd apps/web && npx playwright test admin-dashboard.spec.ts --project=chromium
```

Expected: 3개 테스트 통과

- [ ] **Step 3: 커밋**

```bash
git add apps/web/e2e/admin-dashboard.spec.ts
git commit -m "test: 관리자 대시보드 E2E 테스트 3개"
```

---

### Task 5: 운영자 플로우 E2E 테스트

**Files:**

- Create: `apps/web/e2e/operator.spec.ts`

- [ ] **Step 1: 운영자 테스트 작성**

`apps/web/e2e/operator.spec.ts`:

```typescript
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

  test('모바일 뷰포트에서 사이드바 토글', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/operator');
    // Sheet 트리거 버튼 확인
    const menuButton = page.getByRole('button', { name: /메뉴/ });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.getByRole('navigation')).toBeVisible();
    }
  });
});
```

- [ ] **Step 2: 테스트 실행**

```bash
cd apps/web && npx playwright test operator.spec.ts --project=chromium
```

Expected: 3개 테스트 통과

- [ ] **Step 3: 커밋**

```bash
git add apps/web/e2e/operator.spec.ts
git commit -m "test: 운영자 플로우 E2E 테스트 3개"
```

---

## Chunk 2: 성능 최적화

### Task 6: Next.js 설정 최적화

**Files:**

- Modify: `apps/web/next.config.ts`

- [ ] **Step 1: next.config.ts 확장**

`apps/web/next.config.ts`:

```typescript
import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  transpilePackages: ['shared'],

  // 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.kakaocdn.net',
      },
    ],
  },

  // 프로덕션 최적화
  compress: true,
  poweredByHeader: false,

  // 실험적 최적화
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@tanstack/react-query'],
  },
};

export default withBundleAnalyzer(nextConfig);
```

- [ ] **Step 2: bundle-analyzer 설치**

```bash
npm install -D @next/bundle-analyzer --workspace=apps/web
```

- [ ] **Step 3: package.json에 analyze 스크립트 추가**

`apps/web/package.json`:

```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```

- [ ] **Step 4: 타입체크**

```bash
npm run typecheck
```

Expected: 에러 0

- [ ] **Step 5: 커밋**

```bash
git add apps/web/next.config.ts apps/web/package.json
git commit -m "perf: Next.js 이미지 최적화, 번들 분석기, 패키지 최적화 설정"
```

---

### Task 7: API 캐시 헤더 미들웨어

**Files:**

- Create: `apps/api/src/middleware/cache-control.ts`
- Modify: `apps/api/src/app.ts` (미들웨어 등록)

- [ ] **Step 1: 캐시 헤더 미들웨어 작성**

`apps/api/src/middleware/cache-control.ts`:

```typescript
import type { MiddlewareHandler } from 'hono';

/**
 * API 응답 캐시 헤더 — 엔드포인트 패턴별 캐시 정책
 *
 * - 정적 데이터 (스튜디오 목록, 서비스 목록): 5분 캐시 + stale-while-revalidate
 * - 동적 데이터 (예약, 슬롯): no-cache (항상 최신)
 * - Cron/인증: no-store
 */
export function cacheControl(): MiddlewareHandler {
  // 5분 캐시 대상 경로 패턴
  const CACHEABLE_GET_PATTERNS = [
    /^\/api\/studios$/,
    /^\/api\/services$/,
    /^\/api\/admin\/settings$/,
    /^\/api\/admin\/tiers$/,
    /^\/api\/admin\/announcements$/,
  ];

  // 캐시 금지 경로 패턴
  const NO_STORE_PATTERNS = [/^\/api\/auth\//, /^\/api\/cron\//];

  return async (c, next) => {
    await next();

    // GET 요청만 캐시 대상
    if (c.req.method !== 'GET') return;

    const path = c.req.path;

    if (NO_STORE_PATTERNS.some((p) => p.test(path))) {
      c.header('Cache-Control', 'no-store');
      return;
    }

    if (CACHEABLE_GET_PATTERNS.some((p) => p.test(path))) {
      c.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
      return;
    }

    // 기본: 프라이빗, 재검증 필수
    c.header('Cache-Control', 'private, no-cache');
  };
}
```

- [ ] **Step 2: app.ts에 미들웨어 등록**

`apps/api/src/app.ts`에서 기존 미들웨어 등록 라인 다음에 추가:

```typescript
import { cacheControl } from './middleware/cache-control';
// ... 기존 미들웨어 이후에
app.use('*', cacheControl());
```

- [ ] **Step 3: 타입체크 + 테스트**

```bash
npm run typecheck && npm test
```

Expected: 에러 0, 235 테스트 통과

- [ ] **Step 4: 커밋**

```bash
git add apps/api/src/middleware/cache-control.ts apps/api/src/app.ts
git commit -m "perf: API 캐시 헤더 미들웨어 — 정적 데이터 5분 캐시"
```

---

### Task 8: 폰트 최적화 (next/font)

**Files:**

- Modify: `apps/web/src/app/layout.tsx` (next/font 적용)
- Modify: `apps/web/src/app/globals.css` (외부 @font-face 제거)

- [ ] **Step 1: layout.tsx 확인 후 next/font 적용**

현재 globals.css에서 Pretendard를 외부 CDN으로 로드 중. next/font/local 또는 next/font/google로 교체하여 폰트 파일을 셀프 호스팅 + 자동 최적화.

`apps/web/src/app/layout.tsx`에 추가:

```typescript
import localFont from 'next/font/local';

const pretendard = localFont({
  src: [
    {
      path: '../fonts/PretendardVariable.woff2',
      style: 'normal',
    },
  ],
  variable: '--font-pretendard',
  display: 'swap',
  preload: true,
});
```

**주의:** Pretendard Variable 폰트 파일(`PretendardVariable.woff2`)을 `apps/web/src/fonts/`에 다운로드해야 합니다. 없으면 CDN 유지하되 `<link rel="preconnect">` 추가.

대안 (CDN 유지 시): layout.tsx `<head>`에 preconnect 추가:

```tsx
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
```

- [ ] **Step 2: globals.css에서 CDN @import 확인 및 정리**

Pretendard CDN import가 있다면 next/font으로 교체 후 제거. 없으면 preconnect만 추가.

- [ ] **Step 3: 타입체크**

```bash
npm run typecheck
```

Expected: 에러 0

- [ ] **Step 4: 커밋**

```bash
git add apps/web/src/app/layout.tsx apps/web/src/app/globals.css
git commit -m "perf: 폰트 최적화 — preconnect 또는 next/font 셀프 호스팅"
```

---

### Task 9: 정적 페이지 ISR/SSG 최적화

**Files:**

- Modify: `apps/web/src/app/(landing)/page.tsx` (정적 생성)

- [ ] **Step 1: 랜딩 페이지에 정적 생성 적용**

랜딩 페이지는 서버 데이터 의존성이 없으므로 정적 생성 가능:

`apps/web/src/app/(landing)/page.tsx` 상단에 추가:

```typescript
export const dynamic = 'force-static';
export const revalidate = 3600; // 1시간마다 재생성
```

- [ ] **Step 2: 빌드 테스트**

```bash
cd apps/web && npx next build 2>&1 | grep -E "○|●|ƒ|λ"
```

Expected: 랜딩 페이지가 `○` (Static)으로 표시

- [ ] **Step 3: 커밋**

```bash
git add apps/web/src/app/\(landing\)/page.tsx
git commit -m "perf: 랜딩 페이지 정적 생성 (ISR 1시간)"
```

---

### Task 10: 최종 번들 분석 + 검증

- [ ] **Step 1: 번들 분석 실행**

```bash
cd apps/web && ANALYZE=true npx next build
```

브라우저에서 번들 시각화 확인. lucide-react, recharts 트리셰이킹 적용 여부 체크.

- [ ] **Step 2: Lighthouse 점수 확인 (선택)**

```bash
npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse.json --chrome-flags="--headless"
```

- [ ] **Step 3: 전체 검증**

```bash
npm run typecheck && npm run lint && npm test
```

Expected: 타입 에러 0, ESLint 에러 0, 235 테스트 통과

- [ ] **Step 4: 최종 커밋 + 푸시**

```bash
git add -A
git commit -m "perf: 최종 번들 분석 검증 완료"
git push
```
