import { describe, it, expect } from 'vitest';
import { timeSlotStateMachine } from '../state-machine';
import { generateSlots } from '../generator';
import { InvalidTransitionError } from '../../state-machine';

describe('timeSlotStateMachine', () => {
  describe('허용 전이', () => {
    it('AVAILABLE → RESERVED 전이 허용', () => {
      expect(timeSlotStateMachine.transition('AVAILABLE', 'RESERVED')).toBe('RESERVED');
    });

    it('RESERVED → IN_USE 전이 허용', () => {
      expect(timeSlotStateMachine.transition('RESERVED', 'IN_USE')).toBe('IN_USE');
    });

    it('IN_USE → CLEANING 전이 허용', () => {
      expect(timeSlotStateMachine.transition('IN_USE', 'CLEANING')).toBe('CLEANING');
    });

    it('IN_USE → COMPLETED 전이 허용', () => {
      expect(timeSlotStateMachine.transition('IN_USE', 'COMPLETED')).toBe('COMPLETED');
    });

    it('CLEANING → AVAILABLE 전이 허용', () => {
      expect(timeSlotStateMachine.transition('CLEANING', 'AVAILABLE')).toBe('AVAILABLE');
    });

    it('CLEANING → COMPLETED 전이 허용', () => {
      expect(timeSlotStateMachine.transition('CLEANING', 'COMPLETED')).toBe('COMPLETED');
    });

    it('AVAILABLE → BLOCKED 전이 허용', () => {
      expect(timeSlotStateMachine.transition('AVAILABLE', 'BLOCKED')).toBe('BLOCKED');
    });

    it('BLOCKED → AVAILABLE 전이 허용', () => {
      expect(timeSlotStateMachine.transition('BLOCKED', 'AVAILABLE')).toBe('AVAILABLE');
    });
  });

  describe('금지 전이', () => {
    it('AVAILABLE → COMPLETED 전이 금지', () => {
      expect(() => timeSlotStateMachine.transition('AVAILABLE', 'COMPLETED')).toThrow(
        InvalidTransitionError,
      );
    });

    it('RESERVED → AVAILABLE 전이 금지', () => {
      expect(() => timeSlotStateMachine.transition('RESERVED', 'AVAILABLE')).toThrow(
        InvalidTransitionError,
      );
    });

    it('COMPLETED → AVAILABLE 전이 금지 (종료 상태)', () => {
      expect(() => timeSlotStateMachine.transition('COMPLETED', 'AVAILABLE')).toThrow(
        InvalidTransitionError,
      );
    });
  });

  describe('상태 조회', () => {
    it('COMPLETED가 종료 상태', () => {
      expect(timeSlotStateMachine.isTerminal('COMPLETED')).toBe(true);
    });

    it('AVAILABLE은 종료 상태 아님', () => {
      expect(timeSlotStateMachine.isTerminal('AVAILABLE')).toBe(false);
    });

    it('RESERVED는 종료 상태 아님', () => {
      expect(timeSlotStateMachine.isTerminal('RESERVED')).toBe(false);
    });

    it('AVAILABLE에서 허용 전이 목록 조회', () => {
      const allowed = timeSlotStateMachine.getAllowedTransitions('AVAILABLE');
      expect(allowed).toContain('RESERVED');
      expect(allowed).toContain('BLOCKED');
      expect(allowed).not.toContain('COMPLETED');
      expect(allowed).not.toContain('IN_USE');
    });
  });
});

describe('generateSlots', () => {
  it('09:00~22:00, 60분 슬롯, 30분 청소 → 9개 슬롯 생성', () => {
    // 블록=90분, 첫 슬롯 09:00, 마지막 슬롯 21:00~22:00 (endTime=22:00 포함)
    const slots = generateSlots({
      operatingHoursStart: '09:00',
      operatingHoursEnd: '22:00',
      slotDurationMinutes: 60,
      cleaningDurationMinutes: 30,
    });
    expect(slots).toHaveLength(9);
  });

  it('첫 번째 슬롯: 09:00~10:00, 청소 종료 10:30', () => {
    const slots = generateSlots({
      operatingHoursStart: '09:00',
      operatingHoursEnd: '22:00',
      slotDurationMinutes: 60,
      cleaningDurationMinutes: 30,
    });
    expect(slots[0]).toEqual({
      startTime: '09:00',
      endTime: '10:00',
      cleaningEndTime: '10:30',
    });
  });

  it('마지막 슬롯의 endTime이 operatingHoursEnd 이하', () => {
    const slots = generateSlots({
      operatingHoursStart: '09:00',
      operatingHoursEnd: '22:00',
      slotDurationMinutes: 60,
      cleaningDurationMinutes: 30,
    });
    const last = slots.at(-1);
    expect(last).toBeDefined();
    // endTime(HH:MM) ≤ '22:00'
    if (last) {
      expect(last.endTime <= '22:00').toBe(true);
    }
  });

  it('cleaningEndTime이 운영 종료 시간을 넘지 않음', () => {
    const slots = generateSlots({
      operatingHoursStart: '09:00',
      operatingHoursEnd: '22:00',
      slotDurationMinutes: 60,
      cleaningDurationMinutes: 30,
    });
    for (const slot of slots) {
      expect(slot.cleaningEndTime <= '22:00').toBe(true);
    }
  });

  it('슬롯 시간이 운영시간보다 길면 빈 배열 반환', () => {
    const slots = generateSlots({
      operatingHoursStart: '09:00',
      operatingHoursEnd: '10:00',
      slotDurationMinutes: 120,
      cleaningDurationMinutes: 30,
    });
    expect(slots).toHaveLength(0);
  });

  it('운영 시간과 슬롯 시간이 정확히 일치하면 슬롯 1개 생성', () => {
    // 09:00~10:00, 60분 슬롯, 청소 0분 → 1개
    const slots = generateSlots({
      operatingHoursStart: '09:00',
      operatingHoursEnd: '10:00',
      slotDurationMinutes: 60,
      cleaningDurationMinutes: 0,
    });
    expect(slots).toHaveLength(1);
    expect(slots[0]?.startTime).toBe('09:00');
    expect(slots[0]?.endTime).toBe('10:00');
  });
});
