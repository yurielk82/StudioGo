import { describe, it, expect } from 'vitest';
import { getCheckinState, canCheckIn, canCheckOut } from '../index';

describe('getCheckinState', () => {
  it('checkedInAt이 null이면 NOT_CHECKED_IN', () => {
    expect(getCheckinState(null, null)).toBe('NOT_CHECKED_IN');
  });

  it('checkedInAt이 있고 checkedOutAt이 null이면 CHECKED_IN', () => {
    expect(getCheckinState(new Date('2026-03-08T09:00:00'), null)).toBe('CHECKED_IN');
  });

  it('checkedInAt, checkedOutAt 모두 있으면 CHECKED_OUT', () => {
    expect(getCheckinState(new Date('2026-03-08T09:00:00'), new Date('2026-03-08T10:00:00'))).toBe(
      'CHECKED_OUT',
    );
  });
});

describe('canCheckIn', () => {
  it('NOT_CHECKED_IN 상태만 체크인 가능', () => {
    expect(canCheckIn('NOT_CHECKED_IN')).toBe(true);
  });

  it('CHECKED_IN 상태에서 체크인 불가', () => {
    expect(canCheckIn('CHECKED_IN')).toBe(false);
  });

  it('CHECKED_OUT 상태에서 체크인 불가', () => {
    expect(canCheckIn('CHECKED_OUT')).toBe(false);
  });
});

describe('canCheckOut', () => {
  it('CHECKED_IN 상태만 체크아웃 가능', () => {
    expect(canCheckOut('CHECKED_IN')).toBe(true);
  });

  it('NOT_CHECKED_IN 상태에서 체크아웃 불가', () => {
    expect(canCheckOut('NOT_CHECKED_IN')).toBe(false);
  });

  it('CHECKED_OUT 상태에서 체크아웃 불가', () => {
    expect(canCheckOut('CHECKED_OUT')).toBe(false);
  });
});
