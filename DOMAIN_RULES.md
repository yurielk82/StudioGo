# StudioGo Domain Rules

## 예약 규칙

### 예약 가능 조건
- 사용자 상태가 APPROVED
- 해당 날짜가 운영일 (blackout 없음)
- advance booking 기간 내 (max_advance_booking_days 설정)
- 해당 time_slot 상태가 AVAILABLE
- 하루 최대 예약 수 미초과 (max_slots_per_day_per_member 설정)

### 하루 최대 예약 수
- `operation_settings.max_slots_per_day_per_member` 기반
- 동일 날짜 + 동일 사용자의 활성 예약(PENDING + APPROVED) 합산
- 서버에서 최종 검증

### 취소 가능 조건
- 예약 상태: PENDING 또는 APPROVED
- PENDING: 즉시 취소 가능
- APPROVED: `cancellation_deadline_hours` 전까지만 가능
  - 예약 시작시간 - 현재시간 >= cancellation_deadline_hours
- OPERATOR/ADMIN: 제한 없이 취소 가능 (사유 필수)

### Auto Approve 조건
- `operation_settings.auto_approve_gold_above` = true
- 사용자 티어가 GOLD 이상 (GOLD, PLATINUM, DIAMOND)
- 조건 충족 시 PENDING → APPROVED 자동 전이
- auto approve 시에도 reservation_status_history 기록

### 예약번호 생성
- 형식: `SG-YYYYMMDD-NNN` (예: SG-20260307-001)
- `daily_counters` 테이블 기반 원자적 생성
- key: `reservation_{date}`, value: 순번
- DB transaction 내에서 증가 + 사용

### Hold 규칙
- Step 3 시간 선택 시 2분 hold 생성
- 같은 time_slot에 ACTIVE hold는 하나만 허용
- hold 만료 시 자동 해제 (cron: expire-holds)
- 예약 생성 시 hold consume (ACTIVE → CONSUMED)
- hold 없이 예약 생성 시 직접 가용 확인 + 예약 (경쟁 조건 대비)

## 슬롯 규칙

### 슬롯 생성
- `operating_hours` (start/end) 기준
- `slot_duration_minutes` 간격으로 분할
- 각 슬롯 뒤에 `cleaning_duration_minutes` 추가
- 예: 09:00~10:00 방송, 10:00~10:30 청소

### 설정 변경 시
- 미래 미예약(AVAILABLE) 슬롯만 재생성
- 기존 RESERVED/IN_USE 슬롯은 보존
- 승인된 예약의 슬롯은 절대 덮어쓰지 않음

## Blackout 규칙

### 적용
- 특정 스튜디오 + 시간 범위로 차단
- 타입: HOLIDAY / MAINTENANCE / MANUAL / EVENT
- 반복 차단 지원 가능 (repeatRule jsonb)

### 충돌 처리
- 활성 예약(PENDING/APPROVED)이 있는 시간과 충돌 시 → 기본은 생성 실패
- force 옵션 시: 영향 분석 + 알림 + 로그 + 차단 생성
- 미래 AVAILABLE 슬롯은 BLOCKED 처리

## 티어 규칙

### 승급 기준
- `tier_thresholds` 설정 기반
- 기본: BRONZE(0) → SILVER(5) → GOLD(15) → PLATINUM(30) → DIAMOND(60)
- 방송 완료(broadcast_history.status = COMPLETED) 횟수 기준

### 재계산 시점
- 방송 완료 처리 시 자동 재계산
- ADMIN 수동 전체 재계산
- 변경 시 `tier_history` 기록 + 알림 이벤트 생성

### 다운그레이드
- 기준 미만 시 다운그레이드 가능
- ADMIN 설정에 따라 활성화/비활성화

## 알림 규칙

### 발송 구조
- 서비스 액션 → `notification_jobs` 적재 (외부 API 직접 호출 금지)
- cron 또는 요청 기반 processor가 실제 발송
- `idempotencyKey`로 중복 발송 방지
- 실패 시 재시도 (maxRetries: 3)
- 결과는 `notification_logs`에 기록

### Fallback
- 카카오 알림톡 실패 → 인앱 알림 + 푸시 알림

## 포장/정산 규칙

### 포장 (fulfillment_tasks)
- 방송 완료 후 사용 서비스 기반 생성
- 상태: PENDING → PACKING → READY → SHIPPED → COMPLETED
- 송장번호, 택배사, 수량 관리

### 정산 (settlements)
- 사용료 + 서비스료 + 패널티 = 총액
- 계산 로직은 domain calculator로 분리
- 상태: PENDING → CONFIRMED → SETTLED

## 권한 규칙

### 원칙
- UI 숨김은 편의일 뿐
- **서버 정책이 최종 권한 검증**
- `operator_permissions` 테이블로 세분화
- ADMIN은 모든 권한 override

### OPERATOR 권한 항목
- canApproveReservation
- canRejectReservation
- canManageMembers
- canApproveMember
- canManageStudios
- canViewStatistics
- canSendNotification
- canManageServices

## 시간대 규칙

- 비즈니스 기준: `Asia/Seoul`
- 모든 날짜/시간 계산은 중앙 date-time 유틸 사용
- DB 저장: UTC timestamp
- 비즈니스 비교/표시: KST 변환
- JS Date 직접 사용 금지 → 전용 서비스/유틸 사용
