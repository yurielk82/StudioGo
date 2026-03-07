// ── 범용 상태 머신 엔진 ──────────────────────────
// 모든 엔티티의 상태 전이를 중앙에서 관리한다.
// if문 분산 금지 — 이 모듈의 transition 함수를 통해서만 상태를 변경하라.

export interface TransitionRule<TStatus extends string> {
  from: TStatus;
  to: TStatus;
}

export interface StateMachineConfig<TStatus extends string> {
  name: string;
  transitions: TransitionRule<TStatus>[];
  terminalStates: TStatus[];
}

export class InvalidTransitionError extends Error {
  constructor(
    public readonly machine: string,
    public readonly from: string,
    public readonly to: string,
  ) {
    super(`[${machine}] 허용되지 않는 상태 전이: ${from} → ${to}`);
    this.name = 'InvalidTransitionError';
  }
}

export function createStateMachine<TStatus extends string>(config: StateMachineConfig<TStatus>) {
  const transitionSet = new Set(
    config.transitions.map((t) => `${t.from}→${t.to}`),
  );

  function canTransition(from: TStatus, to: TStatus): boolean {
    return transitionSet.has(`${from}→${to}`);
  }

  function transition(from: TStatus, to: TStatus): TStatus {
    if (!canTransition(from, to)) {
      throw new InvalidTransitionError(config.name, from, to);
    }
    return to;
  }

  function isTerminal(status: TStatus): boolean {
    return config.terminalStates.includes(status);
  }

  function getAllowedTransitions(from: TStatus): TStatus[] {
    return config.transitions
      .filter((t) => t.from === from)
      .map((t) => t.to);
  }

  return {
    name: config.name,
    canTransition,
    transition,
    isTerminal,
    getAllowedTransitions,
  };
}

export type StateMachine<TStatus extends string> = ReturnType<typeof createStateMachine<TStatus>>;
