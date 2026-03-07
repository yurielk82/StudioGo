// shared/domain — 순수 비즈니스 규칙
// React, Hono, Drizzle import 금지

// 범용 상태 머신
export { createStateMachine, InvalidTransitionError, type StateMachine } from './state-machine';

// 예약
export {
  reservationStateMachine,
  canCancelReservation,
  canCreateReservation,
  shouldAutoApprove,
  isWithinBookingWindow,
  generateReservationNumber,
} from './reservation';

// 타임슬롯
export { timeSlotStateMachine, generateSlots, type GeneratedSlot } from './slot';

// 알림
export { notificationJobStateMachine, shouldRetry } from './notification';

// 포장/출고
export { fulfillmentStateMachine } from './fulfillment';

// 정산
export { settlementStateMachine, calculateSettlement, type SettlementResult } from './settlement';

// 티어
export {
  calculateTier,
  broadcastsUntilNextTier,
  hasTierChanged,
  getTierDirection,
} from './tier';

// 체크인
export { getCheckinState, canCheckIn, canCheckOut, type CheckinState } from './checkin';

// 날짜/시간
export {
  nowKST,
  toKSTDateString,
  toKSTTimeString,
  kstToUTC,
  kstDateToUTCStart,
  kstDateToUTCEnd,
  todayKST,
  diffMinutes,
  addDays,
  dateRange,
  getBusinessTimezone,
} from './date-time';

// 설정
export {
  SETTINGS_DEFAULTS,
  parseSettingValue,
  type SettingsMap,
  type SettingsKey,
} from './settings';
