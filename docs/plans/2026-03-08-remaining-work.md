# StudioGo 남은 작업 계획

> 작성일: 2026-03-08
> 최종 업데이트: 2026-03-08 (Phase 1~8 완료 후 재분석)
> 기준: 실제 코드 분석 결과

## 현재 구현 상태 요약

### 완료된 것

- **API**: 82/82 엔드포인트 100% 구현 (12개 라우트 파일)
- **DB**: 28개 테이블, 마이그레이션 1개, 시드 7개 완성
- **모바일**: 31/32 화면 완성 (공개5 + 회원5 + 운영자5 + 관리자10 + 예약위자드5 + 캘린더1)
- **훅**: 60+개 API 연동 훅 (TanStack Query)
- **디자인 시스템**: 7개 프리미티브 (Screen, StyledText, Button, GlassCard, Input, Badge, Divider)
- **인증**: 카카오 OAuth (네이티브+웹) + JWT + AuthGuard
- **shared/domain**: 상태 머신, 정책, 비즈니스 규칙 95%
- **코드 품질**: TypeScript 에러 0, ESLint 에러 0, 테스트 31개 통과
- **배포**: Vercel Serverless 설정 완료, Cron 5개 등록

### 버전

- Root: 1.2.0
- API: 0.2.0
- Mobile: 0.1.0

---

## Phase A: 환경 셋업 (PC에서 보기) — 15분

> 🔴 블로킹: 이것 없이는 아무것도 실행 불가

### A-1. 환경변수 파일 생성

**apps/api/.env**

```env
DATABASE_URL=postgresql://user:password@host/studiogo?sslmode=require
JWT_SECRET=최소32자-랜덤문자열
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
KAKAO_REST_API_KEY=카카오-REST-API-키
KAKAO_CLIENT_SECRET=카카오-Client-Secret
KAKAO_BIZ_APP_KEY=placeholder
KAKAO_BIZ_SENDER_KEY=placeholder
CRON_SECRET=로컬개발용-시크릿
EXPO_ACCESS_TOKEN=placeholder
APP_URL=http://localhost:8081
ASSET_PUBLIC_BASE_URL=placeholder
ASSET_UPLOAD_BASE_URL=placeholder
PORT=3001
```

**apps/mobile/.env**

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_KAKAO_APP_KEY=카카오-네이티브-앱키
```

### A-2. DB 마이그레이션 + 시드

```bash
cd apps/api
npm run db:migrate    # 28개 테이블 생성
npm run db:seed       # 초기 데이터 (관리자, 스튜디오, 설정 등)
```

### A-3. 실행

```bash
npm run dev:all       # API(3001) + Expo(8081) 동시 실행
# 브라우저에서 http://localhost:8081 접속
```

### 사전 준비물

- [ ] Neon PostgreSQL 프로젝트 (무료 티어 OK)
- [ ] 카카오 개발자 앱 (https://developers.kakao.com)
  - REST API 키, Client Secret, 네이티브 앱 키

---

## Phase B: 보안 수정 — 30분

> 🟡 멤버가 admin API 호출하는 보안 문제

### B-1. 공개 서비스 엔드포인트 추가

**문제**: `ServicesStep.tsx`에서 `GET /admin/services` 호출 → 멤버 권한으로 접근 불가
**해결**: `GET /services` (MEMBER+ 권한) 엔드포인트 추가

| 작업              | 파일                                                          |
| ----------------- | ------------------------------------------------------------- |
| 라우트 추가       | `apps/api/src/routes/services.ts` (신규)                      |
| 서비스 메서드     | `service-repository.ts`의 `findActive()` 재사용               |
| app.ts 등록       | `servicesRoute` 추가                                          |
| 모바일 훅 수정    | `useAdmin.ts`의 `useAdminServices` → 별도 `usePublicServices` |
| ServicesStep 수정 | import 변경                                                   |

---

## Phase C: 기능 완성 — 3시간

### C-1. 체크인 QR 스캐너 (2시간)

**현재**: 체크인 화면 UI 완성, QR 스캔 기능 미구현
**필요**:

1. `expo-camera` 또는 `expo-barcode-scanner` 설치
2. app.config.ts에 카메라 권한 추가
3. QR 스캔 컴포넌트 구현
4. onScan → `POST /operator/checkin` 연동

| 파일                     | 변경                    |
| ------------------------ | ----------------------- |
| `package.json`           | expo-camera 추가        |
| `app.config.ts`          | permissions: ["CAMERA"] |
| `(operator)/checkin.tsx` | QR 스캐너 UI + 핸들러   |

### C-2. asset-service S3/R2 실제 연동 (1시간)

**현재**: placeholder URL 반환
**필요**: 스토리지 선택 후 SDK 연동

| 스토리지      | 비용      | 장점                 |
| ------------- | --------- | -------------------- |
| Cloudflare R2 | 10GB 무료 | egress 무료, S3 호환 |
| Vercel Blob   | 작은 무료 | Vercel 네이티브 통합 |
| AWS S3        | 종량제    | 표준, 풍부한 기능    |

**추천: Cloudflare R2** (비용 효율 최고)

| 파일                                     | 변경                                     |
| ---------------------------------------- | ---------------------------------------- |
| `apps/api/src/services/asset-service.ts` | presigned URL 생성 로직                  |
| `.env`                                   | R2 인증 정보 추가                        |
| `package.json`                           | `@aws-sdk/client-s3` 추가 (R2는 S3 호환) |

---

## Phase D: 품질 강화 — 5시간+

### D-1. 테스트 커버리지 확대 (4시간+)

**현재**: 31개 테스트 (domain 25 + api 6) → 7.3% 엔드포인트 커버리지
**목표**: 핵심 경로 50%+ 커버리지

| 우선순위 | 대상                              | 테스트 수 (예상) |
| -------- | --------------------------------- | ---------------- |
| 1        | auth (로그인/토큰/세션)           | ~10              |
| 2        | reservations (예약 CRUD/상태전이) | ~15              |
| 3        | slots (Hold/만료/가용성)          | ~8               |
| 4        | operator (체크인/포장)            | ~8               |
| 5        | admin (설정/CRUD)                 | ~10              |
| 6        | studios, members, calendar        | ~10              |

### D-2. 캘린더 슬롯 렌더링 검증 (30분)

MonthlyView/WeeklyView/DailyView에서 실제 슬롯 데이터 표시 확인
→ 실행 후 시각적 검증 필요

### D-3. 에러 바운더리 추가 (30분)

전역 ErrorBoundary + fallback UI

---

## 실행 순서 요약

```
Phase A (15분) → 화면에서 볼 수 있음
  ↓
Phase B (30분) → 보안 문제 해결
  ↓
Phase C (3시간) → 기능 100% 완성
  ↓
Phase D (5시간+) → 품질/안정성
```

**총 남은 작업: 약 9시간**

- MVP 실행 가능: Phase A만 (15분)
- 프로덕션 배포 가능: Phase A+B+C (4시간)
- 완전 완성: Phase A+B+C+D (9시간)
