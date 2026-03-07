# StudioGo State Machines

모든 상태 전이는 중앙 transition 함수로 구현한다.
if문 분산 처리 금지.

## 1. Reservations

```
PENDING ──→ APPROVED ──→ COMPLETED (terminal)
  │            │
  │            ├──→ CANCELLED (terminal)
  │            │
  │            └──→ NO_SHOW (terminal)
  │
  ├──→ REJECTED (terminal)
  │
  └──→ CANCELLED (terminal)
```

| From | To | 조건 | Actor |
|------|----|------|-------|
| PENDING | APPROVED | 운영자 승인 또는 auto-approve | OPERATOR/ADMIN/SYSTEM |
| PENDING | REJECTED | 운영자 거절 (사유 필수) | OPERATOR/ADMIN |
| PENDING | CANCELLED | 회원 취소 (즉시 가능) | MEMBER/OPERATOR/ADMIN |
| APPROVED | CANCELLED | 회원: deadline 전, 운영자: 무제한 | MEMBER/OPERATOR/ADMIN |
| APPROVED | COMPLETED | 방송 완료 처리 | OPERATOR/ADMIN |
| APPROVED | NO_SHOW | 미출석 처리 | OPERATOR/ADMIN |

Terminal 상태: REJECTED, COMPLETED, NO_SHOW, CANCELLED

## 2. Time Slots

```
AVAILABLE ──→ RESERVED ──→ IN_USE ──→ CLEANING ──→ AVAILABLE
  │                           │           │
  │                           │           └──→ COMPLETED (terminal)
  │                           │
  │                           └──→ COMPLETED (terminal)
  │
  └──→ BLOCKED ──→ AVAILABLE
```

| From | To | 조건 |
|------|----|------|
| AVAILABLE | RESERVED | 예약 승인 시 |
| RESERVED | IN_USE | 체크인 시 |
| IN_USE | CLEANING | 방송 종료, 청소 시작 |
| IN_USE | COMPLETED | 청소 불필요 시 |
| CLEANING | AVAILABLE | 청소 완료, 재사용 가능 |
| CLEANING | COMPLETED | 영업 종료 시 |
| AVAILABLE | BLOCKED | blackout 적용 |
| BLOCKED | AVAILABLE | blackout 해제 |

## 3. Notification Jobs

```
PENDING ──→ PROCESSING ──→ SENT (terminal)
  ↑              │
  │              └──→ FAILED ──→ PENDING (retry, maxRetries 이내)
  │                     │
  │                     └──→ FAILED (terminal, maxRetries 초과)
  │
  └──→ CANCELLED (terminal, 어느 상태에서든)
```

| From | To | 조건 |
|------|----|------|
| PENDING | PROCESSING | processor 픽업 |
| PROCESSING | SENT | 발송 성공 |
| PROCESSING | FAILED | 발송 실패 |
| FAILED | PENDING | 재시도 (retryCount < maxRetries) |
| any | CANCELLED | 수동 취소 |

## 4. Fulfillment Tasks

```
PENDING ──→ PACKING ──→ READY ──→ SHIPPED ──→ COMPLETED (terminal)
  │            │          │          │
  └────────────┴──────────┴──────────┴──→ CANCELLED (terminal)
```

| From | To | 조건 |
|------|----|------|
| PENDING | PACKING | 포장 시작 |
| PACKING | READY | 포장 완료 |
| READY | SHIPPED | 출고 (송장 입력) |
| SHIPPED | COMPLETED | 배송 완료 확인 |
| active | CANCELLED | 작업 취소 |

## 5. Settlements

```
PENDING ──→ CONFIRMED ──→ SETTLED (terminal)
  │            │
  └────────────┴──→ CANCELLED (terminal)
```

| From | To | 조건 |
|------|----|------|
| PENDING | CONFIRMED | 금액 확정 |
| CONFIRMED | SETTLED | 정산 완료 |
| PENDING | CANCELLED | 정산 취소 |
| CONFIRMED | CANCELLED | 정산 취소 |

## 6. Checkins

```
NOT_CHECKED_IN ──→ CHECKED_IN ──→ CHECKED_OUT
```

| From | To | 조건 |
|------|----|------|
| NOT_CHECKED_IN | CHECKED_IN | QR/PIN/수동 체크인 |
| CHECKED_IN | CHECKED_OUT | 방송 종료 |

## 구현 원칙

1. 각 state machine은 `shared/domain/{entity}/state-machine.ts`에 구현
2. `transition(current, event)` → `next | Error` 패턴
3. 허용되지 않은 전이 시 명시적 에러
4. 전이 시 side effect는 service 레이어에서 처리
5. 모든 전이는 history 테이블에 기록 (reservations의 경우 `reservation_status_history`)
