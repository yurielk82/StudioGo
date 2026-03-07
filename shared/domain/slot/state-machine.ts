import { createStateMachine } from '../state-machine';
import type { TimeSlotStatus } from '../../contracts/enums';

export const timeSlotStateMachine = createStateMachine<TimeSlotStatus>({
  name: 'timeSlot',
  transitions: [
    { from: 'AVAILABLE', to: 'RESERVED' },
    { from: 'RESERVED', to: 'IN_USE' },
    { from: 'IN_USE', to: 'CLEANING' },
    { from: 'IN_USE', to: 'COMPLETED' },
    { from: 'CLEANING', to: 'AVAILABLE' },
    { from: 'CLEANING', to: 'COMPLETED' },
    { from: 'AVAILABLE', to: 'BLOCKED' },
    { from: 'BLOCKED', to: 'AVAILABLE' },
  ],
  terminalStates: ['COMPLETED'],
});
