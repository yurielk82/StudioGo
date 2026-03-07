import { createStateMachine } from '../state-machine';
import type { SettlementStatus } from '../../contracts/enums';

export const settlementStateMachine = createStateMachine<SettlementStatus>({
  name: 'settlement',
  transitions: [
    { from: 'PENDING', to: 'CONFIRMED' },
    { from: 'CONFIRMED', to: 'SETTLED' },
    { from: 'PENDING', to: 'CANCELLED' },
    { from: 'CONFIRMED', to: 'CANCELLED' },
  ],
  terminalStates: ['SETTLED', 'CANCELLED'],
});
