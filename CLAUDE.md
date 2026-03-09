# StudioGo

의류 창고 기반 라이브커머스 스튜디오 예약 플랫폼.
단일 리포: Expo 앱(모바일/웹) + Hono API 서버(Vercel Serverless).

## 기술 스택

- **Frontend**: Expo SDK 52+, React Native, TypeScript strict, NativeWind v5, NativeWindUI
- **Backend**: Hono, Vercel Serverless, Neon PostgreSQL, Drizzle ORM
- **인증**: 카카오 로그인 (네이티브 + 웹 OAuth)
- **알림**: 카카오 알림톡, Expo Push, 인앱 알림
- **상태**: TanStack Query(서버), Zustand(UI only), React Hook Form + Zod

## 프로젝트 구조

- `apps/mobile/` — Expo 앱 (app/ 라우트, src/ 소스)
- `apps/api/` — Hono API (routes → services → repositories)
- `shared/domain/` — 순수 비즈니스 규칙 (React/Hono/Drizzle import 금지)
- `shared/contracts/` — Zod 스키마, DTO, enum (클라이언트-서버 공유)
- `shared/db/` — Drizzle 스키마, 마이그레이션, 시드 (서버 전용)
- `shared/constants/` — 공유 상수

## 핵심 규칙

1. **얇은 라우트, 두꺼운 서비스** — routes는 parse→validate→service→respond만
2. **모듈 경계** — mobile에서 @db import 금지, domain에서 프레임워크 import 금지
3. **상태 머신 중앙화** — reservations, time_slots 등 if문 분산 금지
4. **Zod 필수** — 모든 API 경계에서 런타임 검증
5. **시간대** — Asia/Seoul 기준, 중앙 date-time 유틸 사용
6. **보안** — 카카오 토큰 서버 검증, CRON_SECRET 보호, 민감정보 마스킹

## 커밋 전 검증

```bash
npm run lint && npm run typecheck && npm test
```

## 개발 서버

```bash
npm run dev:all  # 모바일 + API 동시 실행
```

## 문서

- [ARCHITECTURE.md](./ARCHITECTURE.md) — 아키텍처
- [MODULE_BOUNDARIES.md](./MODULE_BOUNDARIES.md) — 모듈 경계
- [DOMAIN_RULES.md](./DOMAIN_RULES.md) — 도메인 규칙
- [STATE_MACHINES.md](./STATE_MACHINES.md) — 상태 머신
- [API_CONTRACTS.md](./API_CONTRACTS.md) — API 계약
- [AI_RULES.md](./AI_RULES.md) — AI 코딩 규칙
- [ENVIRONMENT.md](./ENVIRONMENT.md) — 환경변수
- [SETUP.md](./SETUP.md) — 설치/실행 가이드

## 도메인 컨텍스트

- **BJ(방송인)** = MEMBER: 스튜디오를 빌려 라이브커머스 방송
- **창고 운영자** = OPERATOR: 예약 승인, 체크인, 포장/출고 관리
- **관리자** = ADMIN: 모든 설정, 권한, 시스템 제어
- **스튜디오**: 한정 자원, 예약제 운영
- **슬롯**: 운영시간을 일정 간격으로 나눈 예약 단위
- **Hold**: 예약 위자드 중 2분간 슬롯 임시 점유
- **알림톡**: 카카오 비즈메시지 기반 알림

## 문서 반영

- 사용자향 기능 추가/변경 시 `~/GitHub/codegear-dev-portal/content/studiogo/` 문서 동시 업데이트
- UI 변경 → `user-guide/`, 배포/설정 변경 → `admin-guide/`
- codegear-dev-portal CLAUDE.md 컨벤션 준수
