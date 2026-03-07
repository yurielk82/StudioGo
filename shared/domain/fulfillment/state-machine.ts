import { createStateMachine } from '../state-machine';
import type { FulfillmentStatus } from '../../contracts/enums';

export const fulfillmentStateMachine = createStateMachine<FulfillmentStatus>({
  name: 'fulfillment',
  transitions: [
    { from: 'PENDING', to: 'PACKING' },
    { from: 'PACKING', to: 'READY' },
    { from: 'READY', to: 'SHIPPED' },
    { from: 'SHIPPED', to: 'COMPLETED' },
    { from: 'PENDING', to: 'CANCELLED' },
    { from: 'PACKING', to: 'CANCELLED' },
    { from: 'READY', to: 'CANCELLED' },
    { from: 'SHIPPED', to: 'CANCELLED' },
  ],
  terminalStates: ['COMPLETED', 'CANCELLED'],
});
