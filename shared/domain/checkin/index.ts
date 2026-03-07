// ── 체크인 상태 ──────────────────────────────────
// 체크인은 독립 state machine 대신 간단한 상태 헬퍼로 처리

export type CheckinState = 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT';

export function getCheckinState(
  checkedInAt: Date | null,
  checkedOutAt: Date | null,
): CheckinState {
  if (!checkedInAt) return 'NOT_CHECKED_IN';
  if (!checkedOutAt) return 'CHECKED_IN';
  return 'CHECKED_OUT';
}

export function canCheckIn(state: CheckinState): boolean {
  return state === 'NOT_CHECKED_IN';
}

export function canCheckOut(state: CheckinState): boolean {
  return state === 'CHECKED_IN';
}
