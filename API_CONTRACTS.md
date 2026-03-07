# StudioGo API Contracts

## 기본 규약

### Base URL
- Production: `https://api.studiogo.kr`
- Development: `http://localhost:3001`

### 인증
- `Authorization: Bearer <access_token>`
- access token: JWT (단기)
- refresh token: httpOnly cookie 또는 secure-store

### 응답 형식

```typescript
// 성공
{
  "success": true,
  "data": T,
  "meta"?: { page, limit, total }
}

// 실패
{
  "success": false,
  "error": {
    "code": "RESERVATION_SLOT_UNAVAILABLE",
    "message": "선택한 시간은 이미 예약되었습니다.",
    "details"?: any
  }
}
```

### 에러 코드 Prefix

| Prefix | 도메인 |
|--------|--------|
| AUTH_* | 인증/인가 |
| RESERVATION_* | 예약 |
| SLOT_* | 타임슬롯 |
| NOTIFICATION_* | 알림 |
| SETTINGS_* | 설정 |
| PERMISSION_* | 권한 |
| VALIDATION_* | 입력 검증 |
| MEMBER_* | 회원 |
| STUDIO_* | 스튜디오 |
| FULFILLMENT_* | 포장/출고 |
| SETTLEMENT_* | 정산 |

## 엔드포인트 목록

### Auth

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| POST | /auth/kakao | 카카오 로그인 | public |
| POST | /auth/kakao/callback | 카카오 OAuth 콜백 (웹) | public |
| POST | /auth/signup | 추가정보 입력 (회원가입 완료) | authenticated |
| POST | /auth/refresh | 토큰 갱신 | authenticated |
| POST | /auth/logout | 로그아웃 | authenticated |
| GET | /auth/me | 내 정보 조회 | authenticated |
| GET | /auth/sessions | 내 세션 목록 | authenticated |
| DELETE | /auth/sessions/:id | 세션 해제 | authenticated |

### Reservations

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | /reservations | 예약 목록 (필터) | MEMBER+ |
| GET | /reservations/:id | 예약 상세 | MEMBER+ |
| POST | /reservations | 예약 생성 | MEMBER(APPROVED) |
| POST | /reservations/:id/cancel | 예약 취소 | MEMBER+ |
| POST | /reservations/:id/approve | 예약 승인 | OPERATOR+ |
| POST | /reservations/:id/reject | 예약 거절 | OPERATOR+ |
| POST | /reservations/:id/complete | 방송 완료 | OPERATOR+ |
| POST | /reservations/:id/no-show | 노쇼 처리 | OPERATOR+ |
| POST | /reservations/batch-approve | 일괄 승인 | OPERATOR+ |
| GET | /reservations/my | 내 예약 목록 | MEMBER |
| GET | /reservations/my/stats | 내 통계 | MEMBER |

### Slots

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | /slots | 슬롯 조회 (date, studioId) | MEMBER+ |
| POST | /slots/hold | 슬롯 hold 생성 | MEMBER(APPROVED) |
| DELETE | /slots/hold/:token | hold 해제 | MEMBER |
| POST | /slots/generate | 슬롯 (재)생성 | ADMIN |

### Members

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | /members | 회원 목록 | OPERATOR+ |
| GET | /members/:id | 회원 상세 | OPERATOR+ |
| POST | /members/:id/approve | 회원 승인 | OPERATOR+ |
| POST | /members/:id/suspend | 회원 정지 | OPERATOR+ |
| POST | /members/:id/unsuspend | 정지 해제 | OPERATOR+ |
| PATCH | /members/:id | 회원 정보 수정 | ADMIN |
| GET | /members/:id/history | 예약/방송 이력 | OPERATOR+ |

### Studios

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | /studios | 스튜디오 목록 | MEMBER+ |
| GET | /studios/:id | 스튜디오 상세 | MEMBER+ |
| POST | /studios | 스튜디오 생성 | ADMIN |
| PATCH | /studios/:id | 스튜디오 수정 | ADMIN |
| DELETE | /studios/:id | 스튜디오 삭제 | ADMIN |
| PATCH | /studios/:id/toggle | 활성화 토글 | ADMIN |

### Notifications

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | /notifications | 인앱 알림 목록 | authenticated |
| POST | /notifications/:id/read | 알림 읽음 처리 | authenticated |
| POST | /notifications/read-all | 전체 읽음 | authenticated |
| GET | /notifications/settings | 알림 설정 조회 | ADMIN |
| PATCH | /notifications/settings/:eventType | 알림 설정 수정 | ADMIN |
| POST | /notifications/test | 테스트 발송 | ADMIN |
| GET | /notifications/logs | 발송 이력 | OPERATOR+ |

### Admin

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | /admin/settings | 운영 설정 조회 | ADMIN |
| PATCH | /admin/settings/:key | 운영 설정 수정 | ADMIN |
| GET | /admin/blackouts | blackout 목록 | ADMIN |
| POST | /admin/blackouts | blackout 생성 | ADMIN |
| DELETE | /admin/blackouts/:id | blackout 삭제 | ADMIN |
| GET | /admin/tiers/config | 티어 설정 조회 | ADMIN |
| PATCH | /admin/tiers/config | 티어 설정 수정 | ADMIN |
| POST | /admin/tiers/recalculate | 전체 재계산 | ADMIN |
| GET | /admin/services | 부가서비스 목록 | ADMIN |
| POST | /admin/services | 부가서비스 생성 | ADMIN |
| PATCH | /admin/services/:id | 부가서비스 수정 | ADMIN |
| DELETE | /admin/services/:id | 부가서비스 삭제 | ADMIN |
| GET | /admin/logs | 시스템 로그 | ADMIN |
| GET | /admin/feature-flags | feature flags | ADMIN |
| PATCH | /admin/feature-flags/:key | flag 수정 | ADMIN |
| GET | /admin/announcements | 공지 목록 | ADMIN |
| POST | /admin/announcements | 공지 생성 | ADMIN |
| PATCH | /admin/announcements/:id | 공지 수정 | ADMIN |
| DELETE | /admin/announcements/:id | 공지 삭제 | ADMIN |

### Operator

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | /operator/dashboard | 대시보드 데이터 | OPERATOR+ |
| POST | /operator/checkin | 체크인 처리 | OPERATOR+ |
| POST | /operator/checkout/:id | 체크아웃 | OPERATOR+ |
| GET | /operator/fulfillment | 포장 작업 목록 | OPERATOR+ |
| PATCH | /operator/fulfillment/:id | 포장 상태 변경 | OPERATOR+ |
| GET | /operator/stats | 운영 통계 | OPERATOR+ |
| GET | /operator/permissions | 권한 목록 | ADMIN |
| PATCH | /operator/permissions/:userId | 권한 수정 | ADMIN |

### Calendar

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | /calendar/monthly | 월간 데이터 | MEMBER+ |
| GET | /calendar/weekly | 주간 데이터 | MEMBER+ |
| GET | /calendar/daily | 일간 데이터 | MEMBER+ |

### Waitlist

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| POST | /waitlist | 대기 등록 | MEMBER(APPROVED) |
| DELETE | /waitlist/:id | 대기 취소 | MEMBER |
| GET | /waitlist/my | 내 대기 목록 | MEMBER |

### Cron (Vercel Cron 전용)

| Method | Path | 설명 | 보호 |
|--------|------|------|------|
| GET | /cron/reminders | 방송 리마인더 발송 | CRON_SECRET |
| GET | /cron/daily-summary | 일일 요약 발송 | CRON_SECRET |
| GET | /cron/weekly-report | 주간 리포트 발송 | CRON_SECRET |
| GET | /cron/expire-holds | 만료 hold 정리 | CRON_SECRET |

### Assets

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| POST | /assets/upload-url | 업로드 URL 발급 | authenticated |
| POST | /assets/confirm | 업로드 확인 | authenticated |
