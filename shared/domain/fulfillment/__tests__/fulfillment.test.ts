import { describe, it, expect } from 'vitest';
import { fulfillmentStateMachine } from '../state-machine';
import { InvalidTransitionError } from '../../state-machine';

describe('fulfillmentStateMachine — 정상 플로우', () => {
  it('PENDING → PACKING → READY → SHIPPED → COMPLETED 전체 플로우를 완료한다', () => {
    let status = fulfillmentStateMachine.transition('PENDING', 'PACKING');
    status = fulfillmentStateMachine.transition(status, 'READY');
    status = fulfillmentStateMachine.transition(status, 'SHIPPED');
    status = fulfillmentStateMachine.transition(status, 'COMPLETED');
    expect(status).toBe('COMPLETED');
  });

  it('PENDING → PACKING 전이 허용', () => {
    expect(fulfillmentStateMachine.transition('PENDING', 'PACKING')).toBe('PACKING');
  });

  it('PACKING → READY 전이 허용', () => {
    expect(fulfillmentStateMachine.transition('PACKING', 'READY')).toBe('READY');
  });

  it('READY → SHIPPED 전이 허용', () => {
    expect(fulfillmentStateMachine.transition('READY', 'SHIPPED')).toBe('SHIPPED');
  });

  it('SHIPPED → COMPLETED 전이 허용', () => {
    expect(fulfillmentStateMachine.transition('SHIPPED', 'COMPLETED')).toBe('COMPLETED');
  });
});

describe('fulfillmentStateMachine — CANCELLED 전이', () => {
  it('PENDING → CANCELLED 전이 허용', () => {
    expect(fulfillmentStateMachine.transition('PENDING', 'CANCELLED')).toBe('CANCELLED');
  });

  it('PACKING → CANCELLED 전이 허용', () => {
    expect(fulfillmentStateMachine.transition('PACKING', 'CANCELLED')).toBe('CANCELLED');
  });

  it('READY → CANCELLED 전이 허용', () => {
    expect(fulfillmentStateMachine.transition('READY', 'CANCELLED')).toBe('CANCELLED');
  });

  it('SHIPPED → CANCELLED 전이 허용', () => {
    expect(fulfillmentStateMachine.transition('SHIPPED', 'CANCELLED')).toBe('CANCELLED');
  });

  it('COMPLETED → CANCELLED 전이 금지 (종료 상태)', () => {
    expect(() => fulfillmentStateMachine.transition('COMPLETED', 'CANCELLED')).toThrow(
      InvalidTransitionError,
    );
  });
});

describe('fulfillmentStateMachine — 금지 전이', () => {
  it('PENDING → READY 단계 건너뛰기 금지', () => {
    expect(() => fulfillmentStateMachine.transition('PENDING', 'READY')).toThrow(
      InvalidTransitionError,
    );
  });

  it('PENDING → SHIPPED 단계 건너뛰기 금지', () => {
    expect(() => fulfillmentStateMachine.transition('PENDING', 'SHIPPED')).toThrow(
      InvalidTransitionError,
    );
  });

  it('PACKING → SHIPPED 단계 건너뛰기 금지', () => {
    expect(() => fulfillmentStateMachine.transition('PACKING', 'SHIPPED')).toThrow(
      InvalidTransitionError,
    );
  });

  it('SHIPPED → PACKING 역방향 전이 금지', () => {
    expect(() => fulfillmentStateMachine.transition('SHIPPED', 'PACKING')).toThrow(
      InvalidTransitionError,
    );
  });

  it('COMPLETED → PENDING 전이 금지', () => {
    expect(() => fulfillmentStateMachine.transition('COMPLETED', 'PENDING')).toThrow(
      InvalidTransitionError,
    );
  });

  it('CANCELLED → PENDING 전이 금지', () => {
    expect(() => fulfillmentStateMachine.transition('CANCELLED', 'PENDING')).toThrow(
      InvalidTransitionError,
    );
  });
});

describe('fulfillmentStateMachine — 종료 상태', () => {
  it('COMPLETED는 종료 상태이다', () => {
    expect(fulfillmentStateMachine.isTerminal('COMPLETED')).toBe(true);
  });

  it('CANCELLED는 종료 상태이다', () => {
    expect(fulfillmentStateMachine.isTerminal('CANCELLED')).toBe(true);
  });

  it('PENDING은 종료 상태가 아니다', () => {
    expect(fulfillmentStateMachine.isTerminal('PENDING')).toBe(false);
  });

  it('PACKING은 종료 상태가 아니다', () => {
    expect(fulfillmentStateMachine.isTerminal('PACKING')).toBe(false);
  });

  it('READY는 종료 상태가 아니다', () => {
    expect(fulfillmentStateMachine.isTerminal('READY')).toBe(false);
  });

  it('SHIPPED는 종료 상태가 아니다', () => {
    expect(fulfillmentStateMachine.isTerminal('SHIPPED')).toBe(false);
  });
});

describe('fulfillmentStateMachine — 허용 전이 목록', () => {
  it('PENDING에서 허용되는 전이는 PACKING, CANCELLED이다', () => {
    const allowed = fulfillmentStateMachine.getAllowedTransitions('PENDING');
    expect(allowed).toContain('PACKING');
    expect(allowed).toContain('CANCELLED');
    expect(allowed).not.toContain('READY');
    expect(allowed).not.toContain('SHIPPED');
    expect(allowed).not.toContain('COMPLETED');
  });

  it('COMPLETED에서 허용되는 전이가 없다', () => {
    const allowed = fulfillmentStateMachine.getAllowedTransitions('COMPLETED');
    expect(allowed).toHaveLength(0);
  });
});
