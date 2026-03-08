import { describe, it, expect } from 'vitest';
import { notificationJobStateMachine, shouldRetry } from '../state-machine';
import { InvalidTransitionError } from '../../state-machine';

describe('notificationJobStateMachine — 정상 전이', () => {
  it('PENDING → PROCESSING 전이 허용', () => {
    expect(notificationJobStateMachine.transition('PENDING', 'PROCESSING')).toBe('PROCESSING');
  });

  it('PROCESSING → SENT 전이 허용', () => {
    expect(notificationJobStateMachine.transition('PROCESSING', 'SENT')).toBe('SENT');
  });

  it('PROCESSING → FAILED 전이 허용', () => {
    expect(notificationJobStateMachine.transition('PROCESSING', 'FAILED')).toBe('FAILED');
  });

  it('FAILED → PENDING 전이 허용 (재시도)', () => {
    expect(notificationJobStateMachine.transition('FAILED', 'PENDING')).toBe('PENDING');
  });
});

describe('notificationJobStateMachine — 정상 플로우', () => {
  it('PENDING → PROCESSING → SENT 플로우를 완료한다', () => {
    let status = notificationJobStateMachine.transition('PENDING', 'PROCESSING');
    status = notificationJobStateMachine.transition(status, 'SENT');
    expect(status).toBe('SENT');
  });

  it('PROCESSING → FAILED → PENDING → PROCESSING → SENT 재시도 플로우를 완료한다', () => {
    let status = notificationJobStateMachine.transition('PENDING', 'PROCESSING');
    status = notificationJobStateMachine.transition(status, 'FAILED');
    status = notificationJobStateMachine.transition(status, 'PENDING');
    status = notificationJobStateMachine.transition(status, 'PROCESSING');
    status = notificationJobStateMachine.transition(status, 'SENT');
    expect(status).toBe('SENT');
  });
});

describe('notificationJobStateMachine — CANCELLED 전이', () => {
  it('PENDING → CANCELLED 전이 허용', () => {
    expect(notificationJobStateMachine.transition('PENDING', 'CANCELLED')).toBe('CANCELLED');
  });

  it('PROCESSING → CANCELLED 전이 허용', () => {
    expect(notificationJobStateMachine.transition('PROCESSING', 'CANCELLED')).toBe('CANCELLED');
  });

  it('FAILED → CANCELLED 전이 허용', () => {
    expect(notificationJobStateMachine.transition('FAILED', 'CANCELLED')).toBe('CANCELLED');
  });

  it('SENT → CANCELLED 전이 금지 (종료 상태)', () => {
    expect(() => notificationJobStateMachine.transition('SENT', 'CANCELLED')).toThrow(
      InvalidTransitionError,
    );
  });
});

describe('notificationJobStateMachine — 금지 전이', () => {
  it('PENDING → SENT 직접 전이 금지', () => {
    expect(() => notificationJobStateMachine.transition('PENDING', 'SENT')).toThrow(
      InvalidTransitionError,
    );
  });

  it('PENDING → FAILED 직접 전이 금지', () => {
    expect(() => notificationJobStateMachine.transition('PENDING', 'FAILED')).toThrow(
      InvalidTransitionError,
    );
  });

  it('SENT → PENDING 전이 금지', () => {
    expect(() => notificationJobStateMachine.transition('SENT', 'PENDING')).toThrow(
      InvalidTransitionError,
    );
  });

  it('CANCELLED → PENDING 전이 금지', () => {
    expect(() => notificationJobStateMachine.transition('CANCELLED', 'PENDING')).toThrow(
      InvalidTransitionError,
    );
  });
});

describe('notificationJobStateMachine — 종료 상태', () => {
  it('SENT는 종료 상태이다', () => {
    expect(notificationJobStateMachine.isTerminal('SENT')).toBe(true);
  });

  it('CANCELLED는 종료 상태이다', () => {
    expect(notificationJobStateMachine.isTerminal('CANCELLED')).toBe(true);
  });

  it('PENDING은 종료 상태가 아니다', () => {
    expect(notificationJobStateMachine.isTerminal('PENDING')).toBe(false);
  });

  it('PROCESSING은 종료 상태가 아니다', () => {
    expect(notificationJobStateMachine.isTerminal('PROCESSING')).toBe(false);
  });

  it('FAILED는 종료 상태가 아니다', () => {
    expect(notificationJobStateMachine.isTerminal('FAILED')).toBe(false);
  });
});

describe('shouldRetry', () => {
  it('retryCount=2, maxRetries=3 → true를 반환한다', () => {
    expect(shouldRetry(2, 3)).toBe(true);
  });

  it('retryCount=3, maxRetries=3 → false를 반환한다', () => {
    expect(shouldRetry(3, 3)).toBe(false);
  });

  it('retryCount=0, maxRetries=3 → true를 반환한다', () => {
    expect(shouldRetry(0, 3)).toBe(true);
  });

  it('retryCount=4, maxRetries=3 → false를 반환한다', () => {
    expect(shouldRetry(4, 3)).toBe(false);
  });
});
