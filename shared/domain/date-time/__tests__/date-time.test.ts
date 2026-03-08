import { describe, it, expect } from 'vitest';
import {
  toKSTDateString,
  toKSTTimeString,
  kstToUTC,
  kstDateToUTCStart,
  kstDateToUTCEnd,
  diffMinutes,
  addDays,
  dateRange,
  getBusinessTimezone,
} from '../index';

describe('toKSTDateString', () => {
  it('UTC 2026-03-07T15:00:00Z → KST 2026-03-08로 변환한다', () => {
    const utc = new Date('2026-03-07T15:00:00.000Z');
    expect(toKSTDateString(utc)).toBe('2026-03-08');
  });

  it('UTC 자정은 KST 오전 9시이므로 같은 날짜를 반환한다', () => {
    const utc = new Date('2026-03-08T00:00:00.000Z');
    expect(toKSTDateString(utc)).toBe('2026-03-08');
  });

  it('UTC 2026-03-07T14:59:59Z → KST 2026-03-07로 변환한다', () => {
    const utc = new Date('2026-03-07T14:59:59.000Z');
    expect(toKSTDateString(utc)).toBe('2026-03-07');
  });
});

describe('toKSTTimeString', () => {
  it('UTC 2026-03-08T00:30:00Z → KST "09:30"으로 변환한다', () => {
    const utc = new Date('2026-03-08T00:30:00.000Z');
    expect(toKSTTimeString(utc)).toBe('09:30');
  });

  it('UTC 2026-03-07T15:00:00Z → KST "00:00"으로 변환한다', () => {
    const utc = new Date('2026-03-07T15:00:00.000Z');
    expect(toKSTTimeString(utc)).toBe('00:00');
  });

  it('UTC 2026-03-08T14:59:00Z → KST "23:59"으로 변환한다', () => {
    const utc = new Date('2026-03-08T14:59:00.000Z');
    expect(toKSTTimeString(utc)).toBe('23:59');
  });
});

describe('kstToUTC', () => {
  it("KST ('2026-03-08', '09:00') → UTC 2026-03-08T00:00:00Z로 변환한다", () => {
    const result = kstToUTC('2026-03-08', '09:00');
    expect(result.toISOString()).toBe('2026-03-08T00:00:00.000Z');
  });

  it("KST ('2026-03-08', '00:00') → UTC 2026-03-07T15:00:00Z로 변환한다", () => {
    const result = kstToUTC('2026-03-08', '00:00');
    expect(result.toISOString()).toBe('2026-03-07T15:00:00.000Z');
  });

  it("KST ('2026-03-08', '23:59') → UTC 2026-03-08T14:59:00Z로 변환한다", () => {
    const result = kstToUTC('2026-03-08', '23:59');
    expect(result.toISOString()).toBe('2026-03-08T14:59:00.000Z');
  });
});

describe('kstDateToUTCStart', () => {
  it("KST '2026-03-08' 시작 → UTC 2026-03-07T15:00:00Z를 반환한다", () => {
    const result = kstDateToUTCStart('2026-03-08');
    expect(result.toISOString()).toBe('2026-03-07T15:00:00.000Z');
  });
});

describe('kstDateToUTCEnd', () => {
  it("KST '2026-03-08' 종료 → UTC 2026-03-08T14:59:59Z를 반환한다", () => {
    const result = kstDateToUTCEnd('2026-03-08');
    expect(result.toISOString()).toBe('2026-03-08T14:59:59.000Z');
  });
});

describe('diffMinutes', () => {
  it('30분 차이 → 30을 반환한다', () => {
    const start = new Date('2026-03-08T01:00:00.000Z');
    const end = new Date('2026-03-08T01:30:00.000Z');
    expect(diffMinutes(start, end)).toBe(30);
  });

  it('0분 차이 → 0을 반환한다', () => {
    const now = new Date('2026-03-08T01:00:00.000Z');
    expect(diffMinutes(now, now)).toBe(0);
  });

  it('반올림: 29.5분 → 30을 반환한다', () => {
    const start = new Date('2026-03-08T01:00:00.000Z');
    const end = new Date('2026-03-08T01:29:30.000Z');
    expect(diffMinutes(start, end)).toBe(30);
  });

  it('역방향(end < start) → 음수를 반환한다', () => {
    const start = new Date('2026-03-08T01:30:00.000Z');
    const end = new Date('2026-03-08T01:00:00.000Z');
    expect(diffMinutes(start, end)).toBe(-30);
  });
});

describe('addDays', () => {
  it("'2026-03-08' + 3일 → '2026-03-11'을 반환한다", () => {
    expect(addDays('2026-03-08', 3)).toBe('2026-03-11');
  });

  it('월말 넘김: 2026-03-30 + 3일 → 2026-04-02를 반환한다', () => {
    expect(addDays('2026-03-30', 3)).toBe('2026-04-02');
  });

  it('연말 넘김: 2026-12-31 + 1일 → 2027-01-01을 반환한다', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('0일 → 같은 날짜를 반환한다', () => {
    expect(addDays('2026-03-08', 0)).toBe('2026-03-08');
  });
});

describe('dateRange', () => {
  it("'2026-03-01' ~ '2026-03-03' → 3개 날짜 배열을 반환한다", () => {
    expect(dateRange('2026-03-01', '2026-03-03')).toEqual([
      '2026-03-01',
      '2026-03-02',
      '2026-03-03',
    ]);
  });

  it('같은 날짜 → 단일 날짜 배열을 반환한다', () => {
    expect(dateRange('2026-03-08', '2026-03-08')).toEqual(['2026-03-08']);
  });

  it('월말 넘김 범위도 정상 처리한다', () => {
    expect(dateRange('2026-03-30', '2026-04-01')).toEqual([
      '2026-03-30',
      '2026-03-31',
      '2026-04-01',
    ]);
  });
});

describe('getBusinessTimezone', () => {
  it("'Asia/Seoul'을 반환한다", () => {
    expect(getBusinessTimezone()).toBe('Asia/Seoul');
  });
});
