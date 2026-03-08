import { describe, it, expect } from 'vitest';
import { parseSettingValue, SETTINGS_DEFAULTS } from '../index';

describe('parseSettingValue', () => {
  it('null이면 해당 키의 기본값 반환', () => {
    expect(parseSettingValue('slot_duration_minutes', null)).toBe(
      SETTINGS_DEFAULTS.slot_duration_minutes,
    );
  });

  it('undefined이면 해당 키의 기본값 반환', () => {
    expect(parseSettingValue('cancellation_deadline_hours', undefined)).toBe(
      SETTINGS_DEFAULTS.cancellation_deadline_hours,
    );
  });

  it('숫자 값이 있으면 그대로 반환', () => {
    expect(parseSettingValue('slot_duration_minutes', 30)).toBe(30);
  });

  it('boolean 값이 있으면 그대로 반환', () => {
    expect(parseSettingValue('auto_approve_gold_above', false)).toBe(false);
  });

  it('객체 값이 있으면 그대로 반환', () => {
    const customHours = { start: '10:00', end: '20:00' };
    expect(parseSettingValue('operating_hours', customHours)).toEqual(customHours);
  });

  it('tier_thresholds null이면 기본 임계값 반환', () => {
    const result = parseSettingValue('tier_thresholds', null);
    expect(result).toEqual({ SILVER: 5, GOLD: 15, PLATINUM: 30, DIAMOND: 60 });
  });

  it('operating_hours null이면 기본 운영시간 반환', () => {
    const result = parseSettingValue('operating_hours', null);
    expect(result).toEqual({ start: '09:00', end: '22:00' });
  });

  it('max_advance_booking_days null이면 기본값 14 반환', () => {
    expect(parseSettingValue('max_advance_booking_days', null)).toBe(14);
  });
});

describe('SETTINGS_DEFAULTS', () => {
  it('모든 필수 키가 정의되어 있음', () => {
    expect(SETTINGS_DEFAULTS.operating_hours).toBeDefined();
    expect(SETTINGS_DEFAULTS.slot_duration_minutes).toBeDefined();
    expect(SETTINGS_DEFAULTS.cleaning_duration_minutes).toBeDefined();
    expect(SETTINGS_DEFAULTS.max_advance_booking_days).toBeDefined();
    expect(SETTINGS_DEFAULTS.max_slots_per_day_per_member).toBeDefined();
    expect(SETTINGS_DEFAULTS.cancellation_deadline_hours).toBeDefined();
    expect(SETTINGS_DEFAULTS.auto_approve_gold_above).toBeDefined();
    expect(SETTINGS_DEFAULTS.tier_thresholds).toBeDefined();
    expect(SETTINGS_DEFAULTS.hold_duration_seconds).toBeDefined();
    expect(SETTINGS_DEFAULTS.reminder_before_minutes).toBeDefined();
  });

  it('기본 운영시간은 09:00 ~ 22:00', () => {
    expect(SETTINGS_DEFAULTS.operating_hours).toEqual({ start: '09:00', end: '22:00' });
  });

  it('기본 Hold 시간은 120초', () => {
    expect(SETTINGS_DEFAULTS.hold_duration_seconds).toBe(120);
  });
});
