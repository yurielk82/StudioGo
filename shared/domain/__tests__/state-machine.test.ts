import { describe, it, expect } from 'vitest';
import { createStateMachine, InvalidTransitionError } from '../state-machine';

// 테스트용 단순 주문 상태 머신
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const orderMachine = createStateMachine<OrderStatus>({
  name: 'order',
  transitions: [
    { from: 'PENDING', to: 'CONFIRMED' },
    { from: 'PENDING', to: 'CANCELLED' },
    { from: 'CONFIRMED', to: 'SHIPPED' },
    { from: 'CONFIRMED', to: 'CANCELLED' },
    { from: 'SHIPPED', to: 'DELIVERED' },
  ],
  terminalStates: ['DELIVERED', 'CANCELLED'],
});

describe('createStateMachine', () => {
  describe('머신 생성', () => {
    it('머신 이름이 설정값과 일치한다', () => {
      expect(orderMachine.name).toBe('order');
    });

    it('전이 규칙 없이도 머신을 생성할 수 있다', () => {
      type SimpleStatus = 'A' | 'B';
      const emptyMachine = createStateMachine<SimpleStatus>({
        name: 'empty',
        transitions: [],
        terminalStates: [],
      });
      expect(emptyMachine.name).toBe('empty');
    });
  });

  describe('transition — 유효 전이', () => {
    it('초기 상태에서 허용된 상태로 전이하면 새 상태를 반환한다', () => {
      expect(orderMachine.transition('PENDING', 'CONFIRMED')).toBe('CONFIRMED');
    });

    it('중간 상태에서 다음 상태로 전이하면 새 상태를 반환한다', () => {
      expect(orderMachine.transition('CONFIRMED', 'SHIPPED')).toBe('SHIPPED');
    });

    it('여러 단계 전이 체인이 순서대로 동작한다', () => {
      const s1 = orderMachine.transition('PENDING', 'CONFIRMED');
      const s2 = orderMachine.transition(s1, 'SHIPPED');
      const s3 = orderMachine.transition(s2, 'DELIVERED');
      expect(s3).toBe('DELIVERED');
    });

    it('한 상태에서 두 가지 유효 전이 모두 허용된다', () => {
      expect(orderMachine.transition('PENDING', 'CONFIRMED')).toBe('CONFIRMED');
      expect(orderMachine.transition('PENDING', 'CANCELLED')).toBe('CANCELLED');
    });
  });

  describe('transition — 무효 전이', () => {
    it('정의되지 않은 전이 시 InvalidTransitionError를 던진다', () => {
      expect(() => orderMachine.transition('PENDING', 'DELIVERED')).toThrow(InvalidTransitionError);
    });

    it('에러 메시지에 머신 이름과 from/to 상태가 포함된다', () => {
      expect(() => orderMachine.transition('PENDING', 'DELIVERED')).toThrow(
        '[order] 허용되지 않는 상태 전이: PENDING → DELIVERED',
      );
    });

    it('같은 상태로 전이하면 InvalidTransitionError를 던진다', () => {
      expect(() => orderMachine.transition('PENDING', 'PENDING')).toThrow(InvalidTransitionError);
    });

    it('역방향 전이는 허용되지 않는다', () => {
      expect(() => orderMachine.transition('CONFIRMED', 'PENDING')).toThrow(InvalidTransitionError);
    });

    it('종료 상태에서의 전이는 허용되지 않는다', () => {
      expect(() => orderMachine.transition('DELIVERED', 'SHIPPED')).toThrow(InvalidTransitionError);
      expect(() => orderMachine.transition('CANCELLED', 'PENDING')).toThrow(InvalidTransitionError);
    });

    it('존재하지 않는 상태로의 전이는 허용되지 않는다', () => {
      expect(() => orderMachine.transition('PENDING', 'NONEXISTENT' as OrderStatus)).toThrow(
        InvalidTransitionError,
      );
    });
  });

  describe('canTransition — 전이 가능 여부', () => {
    it('허용된 전이는 true를 반환한다', () => {
      expect(orderMachine.canTransition('PENDING', 'CONFIRMED')).toBe(true);
    });

    it('허용되지 않은 전이는 false를 반환한다', () => {
      expect(orderMachine.canTransition('PENDING', 'DELIVERED')).toBe(false);
    });

    it('같은 상태로의 전이는 false를 반환한다', () => {
      expect(orderMachine.canTransition('PENDING', 'PENDING')).toBe(false);
    });

    it('역방향 전이는 false를 반환한다', () => {
      expect(orderMachine.canTransition('CONFIRMED', 'PENDING')).toBe(false);
    });

    it('종료 상태에서 다른 상태로의 전이는 false를 반환한다', () => {
      expect(orderMachine.canTransition('DELIVERED', 'SHIPPED')).toBe(false);
    });

    it('존재하지 않는 to 상태는 false를 반환한다', () => {
      expect(orderMachine.canTransition('PENDING', 'NONEXISTENT' as OrderStatus)).toBe(false);
    });
  });

  describe('isTerminal — 종료 상태 판별', () => {
    it('선언된 종료 상태는 true를 반환한다', () => {
      expect(orderMachine.isTerminal('DELIVERED')).toBe(true);
      expect(orderMachine.isTerminal('CANCELLED')).toBe(true);
    });

    it('중간 상태는 false를 반환한다', () => {
      expect(orderMachine.isTerminal('PENDING')).toBe(false);
      expect(orderMachine.isTerminal('CONFIRMED')).toBe(false);
      expect(orderMachine.isTerminal('SHIPPED')).toBe(false);
    });

    it('종료 상태가 없는 머신은 모든 상태에서 false를 반환한다', () => {
      type CycleStatus = 'A' | 'B';
      const cycleMachine = createStateMachine<CycleStatus>({
        name: 'cycle',
        transitions: [
          { from: 'A', to: 'B' },
          { from: 'B', to: 'A' },
        ],
        terminalStates: [],
      });
      expect(cycleMachine.isTerminal('A')).toBe(false);
      expect(cycleMachine.isTerminal('B')).toBe(false);
    });
  });

  describe('getAllowedTransitions — 전이 가능 상태 목록', () => {
    it('여러 전이가 있는 상태는 모든 대상 상태를 반환한다', () => {
      const allowed = orderMachine.getAllowedTransitions('PENDING');
      expect(allowed).toContain('CONFIRMED');
      expect(allowed).toContain('CANCELLED');
      expect(allowed).toHaveLength(2);
    });

    it('단일 전이만 있는 상태는 하나의 대상 상태를 반환한다', () => {
      const allowed = orderMachine.getAllowedTransitions('SHIPPED');
      expect(allowed).toEqual(['DELIVERED']);
    });

    it('종료 상태는 빈 배열을 반환한다', () => {
      expect(orderMachine.getAllowedTransitions('DELIVERED')).toEqual([]);
      expect(orderMachine.getAllowedTransitions('CANCELLED')).toEqual([]);
    });

    it('전이가 정의되지 않은 상태는 빈 배열을 반환한다', () => {
      expect(orderMachine.getAllowedTransitions('NONEXISTENT' as OrderStatus)).toEqual([]);
    });
  });

  describe('InvalidTransitionError', () => {
    it('name 필드가 InvalidTransitionError이다', () => {
      const error = new InvalidTransitionError('testMachine', 'FROM', 'TO');
      expect(error.name).toBe('InvalidTransitionError');
    });

    it('machine, from, to 프로퍼티를 갖는다', () => {
      const error = new InvalidTransitionError('testMachine', 'FROM', 'TO');
      expect(error.machine).toBe('testMachine');
      expect(error.from).toBe('FROM');
      expect(error.to).toBe('TO');
    });

    it('Error의 인스턴스이다', () => {
      const error = new InvalidTransitionError('m', 'A', 'B');
      expect(error).toBeInstanceOf(Error);
    });

    it('transition이 던진 에러는 InvalidTransitionError 인스턴스이다', () => {
      try {
        orderMachine.transition('PENDING', 'DELIVERED');
        expect.fail('에러가 발생해야 한다');
      } catch (err) {
        expect(err).toBeInstanceOf(InvalidTransitionError);
        if (err instanceof InvalidTransitionError) {
          expect(err.machine).toBe('order');
          expect(err.from).toBe('PENDING');
          expect(err.to).toBe('DELIVERED');
        }
      }
    });
  });
});
