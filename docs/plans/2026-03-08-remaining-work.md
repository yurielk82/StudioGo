# StudioGo 남은 작업 계획

> 작성일: 2026-03-08
> 기준: API_CONTRACTS.md 대비 실제 구현 갭 분석

## 현재 구현 상태 요약

### API 서버 (apps/api/src)

- **구현 완료**: auth(6), reservations(5), slots(4), notifications(3), cron(5중 2완료+3스켈레톤)
- **총 20개 엔드포인트 구현** / API_CONTRACTS.md 기준 82개 중
- 서비스 4개, 리포지토리 7개, 미들웨어 완료, 라이브러리 완료

### 모바일 (apps/mobile)

- **완료율 ~75%**: public(5), member(8), operator(5), admin(7완료+2스켈레톤)
- hooks 8개 완료, stores 2개 완료, design-system 완료
- StudioSelectStep/ServicesStep에서 Mock 데이터 사용 중

### shared

- **완료율 ~95%**: domain(22파일), contracts(15파일), db(36파일), constants 완료

---

## Phase 1: Studios API

스튜디오는 예약/슬롯의 전제 자원. 가장 먼저 구현.

### 신규 파일

- `apps/api/src/routes/studios.ts`
- `apps/api/src/services/studio-service.ts`
- `apps/api/src/repositories/studio-repository.ts`

### 엔드포인트 (6개)

| Method | Path                | 설명          | 권한    |
| ------ | ------------------- | ------------- | ------- |
| GET    | /studios            | 스튜디오 목록 | MEMBER+ |
| GET    | /studios/:id        | 스튜디오 상세 | MEMBER+ |
| POST   | /studios            | 스튜디오 생성 | ADMIN   |
| PATCH  | /studios/:id        | 스튜디오 수정 | ADMIN   |
| DELETE | /studios/:id        | 스튜디오 삭제 | ADMIN   |
| PATCH  | /studios/:id/toggle | 활성화 토글   | ADMIN   |

### 리포지토리 메서드

- findAll(filters?) / findById(id) / create(data) / update(id, data) / softDelete(id) / toggleActive(id)

---

## Phase 2: Members API

운영자의 회원 관리 기능.

### 신규 파일

- `apps/api/src/routes/members.ts`
- `apps/api/src/services/member-service.ts`
- `apps/api/src/repositories/member-repository.ts` (user-repository.ts 확장 또는 신규)

### 엔드포인트 (7개)

| Method | Path                   | 설명           | 권한      |
| ------ | ---------------------- | -------------- | --------- |
| GET    | /members               | 회원 목록      | OPERATOR+ |
| GET    | /members/:id           | 회원 상세      | OPERATOR+ |
| POST   | /members/:id/approve   | 회원 승인      | OPERATOR+ |
| POST   | /members/:id/suspend   | 회원 정지      | OPERATOR+ |
| POST   | /members/:id/unsuspend | 정지 해제      | OPERATOR+ |
| PATCH  | /members/:id           | 회원 정보 수정 | ADMIN     |
| GET    | /members/:id/history   | 예약/방송 이력 | OPERATOR+ |

### 기존 활용

- user-repository.ts에 이미 updateStatus, findById 존재 → 확장

---

## Phase 3: Admin API

관리자 전용 설정/관리 기능. 가장 규모가 큼.

### 신규 파일

- `apps/api/src/routes/admin.ts`
- `apps/api/src/services/admin-service.ts`
- `apps/api/src/repositories/blackout-repository.ts`
- `apps/api/src/repositories/announcement-repository.ts`
- `apps/api/src/repositories/feature-flag-repository.ts`
- `apps/api/src/repositories/service-repository.ts` (부가서비스)

### 엔드포인트 (18개)

#### 운영 설정 (2개)

| Method | Path                 | 설명           |
| ------ | -------------------- | -------------- |
| GET    | /admin/settings      | 운영 설정 조회 |
| PATCH  | /admin/settings/:key | 운영 설정 수정 |

#### Blackout (3개)

| Method | Path                 | 설명          |
| ------ | -------------------- | ------------- |
| GET    | /admin/blackouts     | blackout 목록 |
| POST   | /admin/blackouts     | blackout 생성 |
| DELETE | /admin/blackouts/:id | blackout 삭제 |

#### 티어 (3개)

| Method | Path                     | 설명           |
| ------ | ------------------------ | -------------- |
| GET    | /admin/tiers/config      | 티어 설정 조회 |
| PATCH  | /admin/tiers/config      | 티어 설정 수정 |
| POST   | /admin/tiers/recalculate | 전체 재계산    |

#### 부가서비스 (4개)

| Method | Path                | 설명            |
| ------ | ------------------- | --------------- |
| GET    | /admin/services     | 부가서비스 목록 |
| POST   | /admin/services     | 부가서비스 생성 |
| PATCH  | /admin/services/:id | 부가서비스 수정 |
| DELETE | /admin/services/:id | 부가서비스 삭제 |

#### 시스템 로그 (1개)

| Method | Path        | 설명        |
| ------ | ----------- | ----------- |
| GET    | /admin/logs | 시스템 로그 |

#### Feature Flags (2개)

| Method | Path                      | 설명      |
| ------ | ------------------------- | --------- |
| GET    | /admin/feature-flags      | flag 목록 |
| PATCH  | /admin/feature-flags/:key | flag 수정 |

#### 공지사항 (3개)

| Method | Path                     | 설명      |
| ------ | ------------------------ | --------- |
| GET    | /admin/announcements     | 공지 목록 |
| POST   | /admin/announcements     | 공지 생성 |
| PATCH  | /admin/announcements/:id | 공지 수정 |
| DELETE | /admin/announcements/:id | 공지 삭제 |

### 기존 활용

- settings-repository.ts (get/set 이미 존재)
- system-log-repository.ts (create 이미 존재, 조회 추가 필요)

---

## Phase 4: Operator API

운영자 전용 기능 (대시보드, 체크인, 포장, 통계).

### 신규 파일

- `apps/api/src/routes/operator.ts`
- `apps/api/src/services/operator-service.ts`
- `apps/api/src/repositories/checkin-repository.ts`
- `apps/api/src/repositories/fulfillment-repository.ts`

### 엔드포인트 (8개)

| Method | Path                          | 설명            | 권한      |
| ------ | ----------------------------- | --------------- | --------- |
| GET    | /operator/dashboard           | 대시보드 데이터 | OPERATOR+ |
| POST   | /operator/checkin             | 체크인 처리     | OPERATOR+ |
| POST   | /operator/checkout/:id        | 체크아웃        | OPERATOR+ |
| GET    | /operator/fulfillment         | 포장 작업 목록  | OPERATOR+ |
| PATCH  | /operator/fulfillment/:id     | 포장 상태 변경  | OPERATOR+ |
| GET    | /operator/stats               | 운영 통계       | OPERATOR+ |
| GET    | /operator/permissions         | 권한 목록       | ADMIN     |
| PATCH  | /operator/permissions/:userId | 권한 수정       | ADMIN     |

---

## Phase 5: Calendar API + Reservations 확장

### Calendar — 신규 파일

- `apps/api/src/routes/calendar.ts`
- `apps/api/src/services/calendar-service.ts`

### Calendar 엔드포인트 (3개)

| Method | Path              | 설명        | 권한    |
| ------ | ----------------- | ----------- | ------- |
| GET    | /calendar/monthly | 월간 데이터 | MEMBER+ |
| GET    | /calendar/weekly  | 주간 데이터 | MEMBER+ |
| GET    | /calendar/daily   | 일간 데이터 | MEMBER+ |

### Reservations 추가 엔드포인트 (6개)

| Method | Path                       | 설명             | 권한      |
| ------ | -------------------------- | ---------------- | --------- |
| GET    | /reservations              | 예약 목록 (필터) | MEMBER+   |
| GET    | /reservations/:id          | 예약 상세        | MEMBER+   |
| POST   | /reservations/:id/complete | 방송 완료        | OPERATOR+ |
| POST   | /reservations/:id/no-show  | 노쇼 처리        | OPERATOR+ |
| GET    | /reservations/my           | 내 예약 목록     | MEMBER    |
| GET    | /reservations/my/stats     | 내 통계          | MEMBER    |

### 기존 확장

- reservation-service.ts에 complete(), noShow(), list(), getById(), getMyReservations(), getMyStats() 추가
- reservation-repository.ts에 findAll(filters), countStats(userId) 추가

---

## Phase 6: Auth + Notifications 확장

### Auth 추가 (2개)

| Method | Path               | 설명      |
| ------ | ------------------ | --------- |
| POST   | /auth/refresh      | 토큰 갱신 |
| DELETE | /auth/sessions/:id | 세션 해제 |

### Notifications 추가 (4개)

| Method | Path                               | 설명           | 권한      |
| ------ | ---------------------------------- | -------------- | --------- |
| GET    | /notifications/settings            | 알림 설정 조회 | ADMIN     |
| PATCH  | /notifications/settings/:eventType | 알림 설정 수정 | ADMIN     |
| POST   | /notifications/test                | 테스트 발송    | ADMIN     |
| GET    | /notifications/logs                | 발송 이력      | OPERATOR+ |

### 기존 확장

- auth-service.ts에 refreshToken(), revokeSession() 추가
- notification-service.ts에 getSettings(), updateSettings(), sendTest(), getLogs() 추가

---

## Phase 7: Waitlist + Assets + Cron 완성

### Waitlist — 신규 파일

- `apps/api/src/routes/waitlist.ts`
- `apps/api/src/services/waitlist-service.ts`
- `apps/api/src/repositories/waitlist-repository.ts`

### Waitlist 엔드포인트 (3개)

| Method | Path          | 설명         | 권한             |
| ------ | ------------- | ------------ | ---------------- |
| POST   | /waitlist     | 대기 등록    | MEMBER(APPROVED) |
| DELETE | /waitlist/:id | 대기 취소    | MEMBER           |
| GET    | /waitlist/my  | 내 대기 목록 | MEMBER           |

### Assets — 신규 파일

- `apps/api/src/routes/assets.ts`
- `apps/api/src/services/asset-service.ts`

### Assets 엔드포인트 (2개)

| Method | Path               | 설명            | 권한          |
| ------ | ------------------ | --------------- | ------------- |
| POST   | /assets/upload-url | 업로드 URL 발급 | authenticated |
| POST   | /assets/confirm    | 업로드 확인     | authenticated |

### Cron 스켈레톤 구현 (3개)

- `processReminders()` — 방송 1시간 전 리마인더
- `processDailySummary()` — 운영자 일일 요약
- `processWeeklyReport()` — 관리자 주간 리포트

---

## Phase 8: 모바일 미완성 보완

### 스켈레톤 → 실구현

1. `(admin)/permissions.tsx` — 운영자 권한 관리 화면
2. `(admin)/notification-settings.tsx` — 알림 설정 화면

### Mock → API 연동

3. `StudioSelectStep.tsx` — Mock 스튜디오 → GET /studios 연동
4. `ServicesStep.tsx` — Mock 서비스 → GET /admin/services 연동

---

## 구현 원칙

1. **기존 패턴 준수**: 라우트→서비스→리포지토리 3계층
2. **Zod 검증**: 모든 API 경계에서 contracts/ 스키마 사용
3. **상태 머신**: shared/domain/ 상태 전이 함수 활용
4. **에러 처리**: ApiError 팩토리 + 에러 코드 (contracts/errors)
5. **미들웨어**: requireAuth/requireOperator/requireAdmin 적용
6. **응답 형식**: success/created/paginated 헬퍼 사용

## 총 규모

| 구분                     | 수량     |
| ------------------------ | -------- |
| 신규 라우트 파일         | 7개      |
| 기존 라우트 확장         | 3개      |
| 신규 서비스 파일         | 7개      |
| 기존 서비스 확장         | 3개      |
| 신규 리포지토리          | 6개      |
| 기존 리포지토리 확장     | 3개      |
| 모바일 화면 구현/보완    | 4개      |
| **총 미구현 엔드포인트** | **62개** |
