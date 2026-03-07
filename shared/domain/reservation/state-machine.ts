import { createStateMachine } from '../state-machine';
import type { ReservationStatus } from '@studiogo/shared/contracts';

export const reservationStateMachine = createStateMachine<ReservationStatus>({
  name: 'reservation',
  transitions: [
    { from: 'PENDING', to: 'APPROVED' },
    { from: 'PENDING', to: 'REJECTED' },
    { from: 'PENDING', to: 'CANCELLED' },
    { from: 'APPROVED', to: 'CANCELLED' },
    { from: 'APPROVED', to: 'COMPLETED' },
    { from: 'APPROVED', to: 'NO_SHOW' },
  ],
  terminalStates: ['REJECTED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'],
});
