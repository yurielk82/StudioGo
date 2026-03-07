import { describe, it, expect } from 'vitest';
import { reservationStateMachine } from '../state-machine';
import { InvalidTransitionError } from '../../state-machine';

describe('reservationStateMachine', () => {
  it('PENDING → APPROVED 전이 허용', () => {
    expect(reservationStateMachine.transition('PENDING', 'APPROVED')).toBe('APPROVED');
  });

  it('PENDING → REJECTED 전이 허용', () => {
    expect(reservationStateMachine.transition('PENDING', 'REJECTED')).toBe('REJECTED');
  });

  it('PENDING → CANCELLED 전이 허용', () => {
    expect(reservationStateMachine.transition('PENDING', 'CANCELLED')).toBe('CANCELLED');
  });

  it('APPROVED → COMPLETED 전이 허용', () => {
    expect(reservationStateMachine.transition('APPROVED', 'COMPLETED')).toBe('COMPLETED');
  });

  it('APPROVED → NO_SHOW 전이 허용', () => {
    expect(reservationStateMachine.transition('APPROVED', 'NO_SHOW')).toBe('NO_SHOW');
  });

  it('APPROVED → CANCELLED 전이 허용', () => {
    expect(reservationStateMachine.transition('APPROVED', 'CANCELLED')).toBe('CANCELLED');
  });

  it('REJECTED → APPROVED 전이 금지', () => {
    expect(() => reservationStateMachine.transition('REJECTED', 'APPROVED')).toThrow(
      InvalidTransitionError,
    );
  });

  it('COMPLETED → PENDING 전이 금지', () => {
    expect(() => reservationStateMachine.transition('COMPLETED', 'PENDING')).toThrow(
      InvalidTransitionError,
    );
  });

  it('CANCELLED → APPROVED 전이 금지', () => {
    expect(() => reservationStateMachine.transition('CANCELLED', 'APPROVED')).toThrow(
      InvalidTransitionError,
    );
  });

  it('종료 상태 확인', () => {
    expect(reservationStateMachine.isTerminal('COMPLETED')).toBe(true);
    expect(reservationStateMachine.isTerminal('REJECTED')).toBe(true);
    expect(reservationStateMachine.isTerminal('NO_SHOW')).toBe(true);
    expect(reservationStateMachine.isTerminal('CANCELLED')).toBe(true);
    expect(reservationStateMachine.isTerminal('PENDING')).toBe(false);
    expect(reservationStateMachine.isTerminal('APPROVED')).toBe(false);
  });

  it('허용 전이 목록 조회', () => {
    const allowed = reservationStateMachine.getAllowedTransitions('PENDING');
    expect(allowed).toContain('APPROVED');
    expect(allowed).toContain('REJECTED');
    expect(allowed).toContain('CANCELLED');
    expect(allowed).not.toContain('COMPLETED');
  });

  it('canTransition 정상 동작', () => {
    expect(reservationStateMachine.canTransition('PENDING', 'APPROVED')).toBe(true);
    expect(reservationStateMachine.canTransition('PENDING', 'COMPLETED')).toBe(false);
  });
});
