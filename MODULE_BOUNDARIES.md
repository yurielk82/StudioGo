# StudioGo Module Boundaries

## 모듈별 책임

### apps/mobile
- UI 렌더링, 사용자 인터랙션
- Expo Router 기반 네비게이션
- TanStack Query로 서버 상태 관리
- Zustand로 UI 상태 관리
- 참조 가능: `@contracts/*`, `@domain/*`, `@constants/*`, 자체 `src/`

### apps/api
- HTTP 요청 처리, 인증/인가
- 비즈니스 로직 실행 (services)
- DB 접근 (repositories)
- 알림 작업 적재 (jobs)
- 참조 가능: `@contracts/*`, `@domain/*`, `@db/*`, `@constants/*`

### shared/domain
- 순수 비즈니스 규칙, 상태 머신, 정책, 계산기
- **React, Hono, Drizzle import 절대 금지**
- 외부 의존성 없는 순수 TypeScript만
- 참조 가능: `@contracts/*`, `@constants/*`

### shared/contracts
- Zod 스키마 (request/response)
- DTO 타입 정의
- Enum 정의
- API 에러 코드
- 클라이언트-서버 양쪽에서 공유

### shared/db
- Drizzle 스키마 정의
- 마이그레이션 파일
- 시드 데이터
- DB 클라이언트 설정
- relations 정의
- **서버 전용 — mobile에서 import 금지**

### shared/constants
- 공유 상수 (비즈니스 규칙 값은 domain에)
- 양쪽 앱에서 참조 가능

## 금지 Import 규칙

| from \ to | mobile | api/routes | api/services | api/repos | domain | contracts | db | constants |
|-----------|--------|------------|-------------|-----------|--------|-----------|-----|-----------|
| **mobile** | — | X | X | X | O | O | **X** | O |
| **api/routes** | X | — | O | **X** | O | O | X | O |
| **api/services** | X | X | — | O | O | O | O | O |
| **api/repos** | X | X | X | — | X | O | O | O |
| **domain** | X | X | X | X | — | O | **X** | O |

O = 허용, X = 금지, **X** = 특별 강조 금지

## 레이어 역할 분리

### routes (얇은 라우트)
```
요청 파싱 → Zod 검증 → auth context → service 호출 → 응답 직렬화
```
- 비즈니스 로직 금지
- raw SQL 금지
- 외부 API 직접 호출 금지

### services (두꺼운 서비스)
- command/query 실행
- 트랜잭션 관리
- 도메인 규칙 적용
- 이벤트/알림 작업 생성
- repository 호출

### repositories (DB 접근)
- CRUD 쿼리 실행
- 조인/집계 쿼리
- 비즈니스 로직 금지
- 트랜잭션 범위는 service가 결정

## index.ts Public API 패턴

각 디렉토리는 `index.ts`에서 public API만 export한다.
deep import 남발 금지.

```typescript
// shared/domain/index.ts
export { ReservationStateMachine } from './reservation/state-machine';
export { TierCalculator } from './tier/calculator';
export { SlotGenerator } from './slot/generator';
// ...
```

## .web.tsx 분리 기준

- UI shell 차이(레이아웃, 네비게이션)만 분리
- 비즈니스 로직은 공유 훅/서비스에서 처리
- 예: `_layout.tsx` (모바일) / `_layout.web.tsx` (웹)
