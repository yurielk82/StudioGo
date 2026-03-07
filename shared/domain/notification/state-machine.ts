import { createStateMachine } from '../state-machine';
import type { NotificationJobStatus } from '../../contracts/enums';

export const notificationJobStateMachine = createStateMachine<NotificationJobStatus>({
  name: 'notificationJob',
  transitions: [
    { from: 'PENDING', to: 'PROCESSING' },
    { from: 'PROCESSING', to: 'SENT' },
    { from: 'PROCESSING', to: 'FAILED' },
    { from: 'FAILED', to: 'PENDING' }, // retry
    { from: 'PENDING', to: 'CANCELLED' },
    { from: 'PROCESSING', to: 'CANCELLED' },
    { from: 'FAILED', to: 'CANCELLED' },
  ],
  terminalStates: ['SENT', 'CANCELLED'],
});

export function shouldRetry(retryCount: number, maxRetries: number): boolean {
  return retryCount < maxRetries;
}
