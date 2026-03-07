# StudioGo Architecture

## 개요

StudioGo는 의류 창고 기반 라이브커머스 스튜디오 예약 플랫폼이다.
단일 리포에 Expo 앱(모바일/웹)과 Hono API 서버(Vercel Serverless)를 함께 둔다.

## 리포 구조

```
studiogo/
  apps/
    mobile/          # Expo 앱 (iOS / Android / Web)
    api/             # Hono API 서버 (Vercel Serverless)
  shared/
    domain/          # 순수 비즈니스 규칙 (React/Hono/Drizzle import 금지)
    contracts/       # Zod 스키마, DTO, enum (클라이언트-서버 공유)
    db/              # Drizzle 스키마, 마이그레이션, 시드 (서버 전용)
    constants/       # 공유 상수
```

## 레이어 구조

### Mobile (apps/mobile)

```
app/               # Expo Router 라우트 (역할별 그룹)
  (public)/        # 로그인, 회원가입, 승인대기
  (member)/        # MEMBER 전용 화면
  (operator)/      # OPERATOR 전용 화면
  (admin)/         # ADMIN 전용 화면

src/
  features/        # 도메인별 기능 모듈 (예약, 캘린더, 알림 등)
  providers/       # React Context providers
  hooks/           # 공용 커스텀 훅
  stores/          # Zustand 스토어 (UI 상태만)
  design-system/   # 디자인 토큰, 테마, 기본 컴포넌트
  lib/             # 유틸리티 (날짜, API 클라이언트 등)
  constants/       # 앱 전용 상수
  components/      # 공용 UI 컴포넌트
```

### API (apps/api)

```
src/
  app.ts           # Hono 엔트리포인트
  routes/          # 얇은 라우트 (parse → validate → service → respond)
  services/        # 비즈니스 로직 (command/query)
  repositories/    # DB 접근 계층
  jobs/            # Cron/요청 기반 프로세서 (알림 발송 등)
  middleware/      # 인증, 권한, 에러 핸들링
  lib/             # 서버 유틸리티
```

## 의존성 방향 (단방향)

```
mobile(UI) ──→ contracts / domain / constants
                    ↑
routes ──→ services ──→ repositories ──→ db
                    ↓
               domain / contracts
```

**금지 방향:**
- mobile → db (절대 금지)
- domain → React / Hono / Drizzle
- routes → repositories (services를 거쳐야 함)
- 화면 컴포넌트 → repository / DB 직접 접근

## 역할별 라우트 vs 도메인별 코드

- **라우트**: 사용자 역할별 폴더 구분 (public, member, operator, admin)
- **코드**: 도메인별 구성 (reservation, studio, notification, member 등)
- **규칙**: 역할별 폴더에 같은 도메인 로직 중복 금지 → features/에서 공유

## 상태 관리

| 구분 | 도구 | 용도 |
|------|------|------|
| 서버 상태 | TanStack Query | 예약, 회원, 스튜디오, 통계 등 |
| UI 상태 | Zustand | 모달, 위자드 단계, 테마 토글 등 |
| 폼 상태 | React Hook Form + Zod | 입력 폼 검증 |

## 배포

| 대상 | 플랫폼 | 도메인 |
|------|--------|--------|
| API | Vercel Serverless | api.studiogo.kr |
| Web | Vercel Static (Expo Web) | app.studiogo.kr |
| iOS/Android | EAS Build → 앱스토어 | — |

## 기술 스택

- **Frontend**: Expo SDK 52+, React Native, TypeScript, NativeWind v5, NativeWindUI
- **Backend**: Hono, Vercel Serverless, Neon PostgreSQL, Drizzle ORM
- **인증**: 카카오 로그인 (네이티브 + 웹 OAuth)
- **알림**: 카카오 알림톡, Expo Push, 인앱 알림
- **품질**: ESLint, Prettier, Husky, Sentry
