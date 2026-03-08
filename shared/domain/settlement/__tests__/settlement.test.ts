import { describe, it, expect } from 'vitest';
import { calculateSettlement } from '../calculator';
import { settlementStateMachine } from '../state-machine';
import { InvalidTransitionError } from '../../state-machine';

describe('calculateSettlement', () => {
  it('서비스 없이 baseAmount만 있으면 totalAmount = baseAmount', () => {
    const result = calculateSettlement({ baseAmount: 50000, services: [] });

    expect(result.amount).toBe(50000);
    expect(result.serviceAmount).toBe(0);
    expect(result.penaltyAmount).toBe(0);
    expect(result.totalAmount).toBe(50000);
  });

  it('서비스 포함 시 totalAmount = baseAmount + serviceAmount', () => {
    const result = calculateSettlement({
      baseAmount: 50000,
      services: [{ unitPrice: 10000, quantity: 2 }],
    });

    expect(result.serviceAmount).toBe(20000);
    expect(result.totalAmount).toBe(70000);
  });

  it('여러 서비스 합산', () => {
    const result = calculateSettlement({
      baseAmount: 50000,
      services: [
        { unitPrice: 10000, quantity: 2 },
        { unitPrice: 5000, quantity: 3 },
      ],
    });

    expect(result.serviceAmount).toBe(35000);
    expect(result.totalAmount).toBe(85000);
  });

  it('위약금 포함 시 totalAmount = baseAmount + penaltyAmount', () => {
    const result = calculateSettlement({
      baseAmount: 50000,
      services: [],
      penaltyAmount: 5000,
    });

    expect(result.penaltyAmount).toBe(5000);
    expect(result.totalAmount).toBe(55000);
  });

  it('baseAmount + 서비스 + 위약금 모두 포함', () => {
    const result = calculateSettlement({
      baseAmount: 50000,
      services: [{ unitPrice: 10000, quantity: 2 }],
      penaltyAmount: 5000,
    });

    expect(result.amount).toBe(50000);
    expect(result.serviceAmount).toBe(20000);
    expect(result.penaltyAmount).toBe(5000);
    expect(result.totalAmount).toBe(75000);
  });

  it('서비스 수량 0이면 서비스 금액 0', () => {
    const result = calculateSettlement({
      baseAmount: 30000,
      services: [{ unitPrice: 10000, quantity: 0 }],
    });

    expect(result.serviceAmount).toBe(0);
    expect(result.totalAmount).toBe(30000);
  });
});

describe('settlementStateMachine', () => {
  it('PENDING → CONFIRMED 전이 허용', () => {
    expect(settlementStateMachine.transition('PENDING', 'CONFIRMED')).toBe('CONFIRMED');
  });

  it('CONFIRMED → SETTLED 전이 허용', () => {
    expect(settlementStateMachine.transition('CONFIRMED', 'SETTLED')).toBe('SETTLED');
  });

  it('PENDING → CANCELLED 전이 허용', () => {
    expect(settlementStateMachine.transition('PENDING', 'CANCELLED')).toBe('CANCELLED');
  });

  it('CONFIRMED → CANCELLED 전이 허용', () => {
    expect(settlementStateMachine.transition('CONFIRMED', 'CANCELLED')).toBe('CANCELLED');
  });

  it('SETTLED → PENDING 전이 불가 (종료 상태)', () => {
    expect(() => settlementStateMachine.transition('SETTLED', 'PENDING')).toThrow(
      InvalidTransitionError,
    );
  });

  it('CANCELLED → CONFIRMED 전이 불가 (종료 상태)', () => {
    expect(() => settlementStateMachine.transition('CANCELLED', 'CONFIRMED')).toThrow(
      InvalidTransitionError,
    );
  });

  it('PENDING → SETTLED 직접 전이 불가', () => {
    expect(() => settlementStateMachine.transition('PENDING', 'SETTLED')).toThrow(
      InvalidTransitionError,
    );
  });

  it('SETTLED는 종료 상태', () => {
    expect(settlementStateMachine.isTerminal('SETTLED')).toBe(true);
  });

  it('CANCELLED는 종료 상태', () => {
    expect(settlementStateMachine.isTerminal('CANCELLED')).toBe(true);
  });

  it('PENDING은 종료 상태 아님', () => {
    expect(settlementStateMachine.isTerminal('PENDING')).toBe(false);
  });
});
