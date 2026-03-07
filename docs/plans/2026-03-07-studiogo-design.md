# StudioGo 설계 문서

## 개요
의류 창고 기반 라이브커머스 스튜디오 예약 플랫폼.
BJ(방송인)가 스튜디오를 빌려 라이브커머스 방송을 하고, 창고 측이 택배 포장/발송 등 부가서비스를 대행하는 구조.

## 사용자 역할
- **MEMBER**: 예약 신청, 캘린더 조회, 방송 이력/통계
- **OPERATOR**: 예약 승인/거절, 회원 관리, 체크인/완료/포장 처리
- **ADMIN**: 모든 설정/권한/운영정책/시스템로그 제어

## 기술 스택
- **Frontend**: Expo SDK 52+, React Native, TypeScript strict, NativeWind v5, NativeWindUI
- **Backend**: Hono, Vercel Serverless, Neon PostgreSQL, Drizzle ORM
- **인증**: 카카오 로그인 (네이티브 + 웹 OAuth)
- **알림**: 카카오 알림톡, Expo Push, 인앱 알림
- **상태**: TanStack Query(서버), Zustand(UI only), React Hook Form + Zod

## 아키텍처
- 단일 리포, 2개 앱 (Expo + Hono)
- Domain-first code organization
- Thin routes, thick services
- State machine 중앙화
- Event/outbox 기반 알림

## 구현 순서

| Phase | 내용 | 상태 |
|-------|------|------|
| 0 | 문서 8종 + 폴더 구조 + 인프라 | 완료 (d55b1a7) |
| 1 | 모바일 디자인 시스템 | 완료 (a616286) |
| 2 | shared/contracts (enums, Zod schemas) | 완료 (5dc45a6) |
| 3 | shared/db (28개 테이블, migrations, seeds) | 완료 (5dc45a6) |
| 4 | shared/domain (state machines, policies, calculators) | 완료 (5dc45a6) |
| 5 | API 서버 (repositories, services, auth, cron) | 완료 (92104b3) |
| 6 | 인증 UI (카카오 로그인, 회원가입, guards) | 완료 (744bdcb) |
| 7 | 예약 플로우 (5단계 위자드, 상세, waitlist) | 완료 (4a5b5bf) |
| 8 | 캘린더 3종 (월/주/일) | 완료 (a922228) |
| 9 | 운영자 화면 전체 | 완료 (894bda9) |
| 10 | 관리자 패널 전체 | 완료 (e7d8340) |
| 11 | 알림 시스템 (jobs, cron, push) | 완료 (d8cfc7f) |
| 12 | 통계/대시보드 | 완료 (90df1b9) |
| 13 | QA/안정화/배포 | 완료 |

## DB 테이블 (28개)
users, operator_permissions, studios, operation_settings, time_slots,
reservations, reservation_services, additional_services, notification_settings,
notification_logs, broadcast_history, tier_history, system_logs, slot_holds,
reservation_status_history, studio_blackouts, daily_counters, auth_sessions,
notification_jobs, app_notifications, push_tokens, reservation_waitlists,
checkins, fulfillment_tasks, settlements, announcements, assets, feature_flags

## 상태 머신
- reservations: PENDING → APPROVED/REJECTED/CANCELLED → COMPLETED/NO_SHOW
- time_slots: AVAILABLE → RESERVED → IN_USE → CLEANING → AVAILABLE/COMPLETED
- notification_jobs: PENDING → PROCESSING → SENT/FAILED
- fulfillment_tasks: PENDING → PACKING → READY → SHIPPED → COMPLETED
- settlements: PENDING → CONFIRMED → SETTLED
- checkins: NOT_CHECKED_IN → CHECKED_IN → CHECKED_OUT

## 배포
- API → Vercel Serverless (api.studiogo.kr)
- Web → Vercel Static / Expo Web (app.studiogo.kr)
- iOS/Android → EAS Build → 앱스토어

## 관련 문서
- [ARCHITECTURE.md](../../ARCHITECTURE.md)
- [MODULE_BOUNDARIES.md](../../MODULE_BOUNDARIES.md)
- [DOMAIN_RULES.md](../../DOMAIN_RULES.md)
- [STATE_MACHINES.md](../../STATE_MACHINES.md)
- [API_CONTRACTS.md](../../API_CONTRACTS.md)
- [AI_RULES.md](../../AI_RULES.md)
- [ENVIRONMENT.md](../../ENVIRONMENT.md)
- [SETUP.md](../../SETUP.md)
