# StudioGo AI Rules

이 프로젝트에서 AI 코딩 에이전트가 반드시 준수해야 할 규칙.

## 아키텍처 규칙

### 1. 화면에 비즈니스 로직 금지
- 화면 컴포넌트(`app/`, `src/features/`)에서 비즈니스 규칙 직접 구현 금지
- 예약 가능 여부, 취소 가능 여부 등은 domain 또는 서버에서 판단
- 화면은 데이터 표시 + 사용자 입력 전달만

### 2. Routes에 로직 금지
- `routes/*.ts`는 얇게 유지: parse → validate → service → respond
- raw SQL, 비즈니스 규칙, 외부 API 호출 금지
- 모든 로직은 services에서 처리

### 3. Deep Import 금지
- 각 모듈의 `index.ts` public API만 import
- `import { X } from '@domain/reservation/internal/helper'` 같은 패턴 금지
- `import { X } from '@domain'` 또는 `import { X } from '@domain/reservation'` 사용

### 4. Utils Dumping 금지
- `utils.ts`를 비즈니스 로직 쓰레기통으로 사용 금지
- 도메인 규칙 → `shared/domain/`
- 날짜 처리 → `shared/domain/date-time/` 또는 `apps/api/src/lib/date-time/`
- 검증 → `shared/contracts/`
- 각 유틸은 명확한 도메인 소속

### 5. Zod 필수
- 모든 API input/output은 Zod schema로 검증
- contracts에서 request/response schema 공유
- 런타임 검증 없는 타입 선언 금지 (API 경계)

### 6. Query/Command 분리
- 읽기 전용 조회는 query service/repository
- 상태 변경은 command service
- 통계/캘린더 쿼리와 트랜잭션 로직 결합 금지

### 7. Critical Mutation Idempotency
- 예약 생성, 알림 발송, 정산 확정 등 중요 CUD는 멱등성 보장
- `idempotencyKey` 또는 unique constraint 기반
- 재시도 시 중복 방어

### 8. System Logs 기록 규칙
- 모든 ADMIN 변경은 `system_logs`에 기록
- 기록 항목: userId, action, target, targetId, details(변경 전/후), ipAddress
- 로그 기록 누락은 버그로 간주

### 9. Feature Flag 규칙
- 신규 기능은 `feature_flags` 테이블로 숨길 수 있어야 함
- 서버 + 클라이언트 양쪽에서 flag 확인
- flag 확인 로직은 중앙화 (서버: middleware/service, 클라이언트: hook)

### 10. `.web.tsx` 분리 기준
- UI shell 차이(레이아웃, 네비게이션, 반응형 분기)만 분리
- 비즈니스 로직은 공유 훅/서비스에서 처리
- 데이터 fetching 로직은 절대 분리하지 않음

## 상태 관리 규칙

### Zustand (UI 상태만)
- modal open/close
- wizard 현재 단계
- 임시 선택값
- theme toggle
- 짧은 생명주기의 UI state

### TanStack Query (서버 상태만)
- 예약, 회원, 스튜디오, 통계, 설정 등
- 캐싱, 무효화, 낙관적 업데이트
- Zustand에 서버 상태 저장 금지

## 데이터 검증 규칙

- null/undefined/optional 처리 일관성 유지
- API 경계에서 반드시 Zod parse
- 내부 함수 간에는 TypeScript 타입 신뢰
- DB nullable 컬럼은 schema에서 명시

## 보안 규칙

- 카카오 토큰 검증은 서버에서만
- client secret은 클라이언트 번들에 절대 포함 금지
- 민감정보(전화번호, 계좌번호)는 role 기반 마스킹
- ADMIN/OPERATOR 권한은 서버에서 최종 검증
- cron 엔드포인트는 CRON_SECRET으로 보호

## 코드 품질 규칙

- `any` 타입 금지
- TODO/placeholder/mock-only 구현 금지
- dead code 방치 금지
- 파일 300줄 MAX, 함수 80줄 MAX
- 동일 패턴 3회 이상 반복 시 공통화 검토
