import { db } from '@db';
import { systemLogs } from '@db/schema';

export const systemLogRepository = {
  async create(data: {
    userId?: string;
    action: string;
    target: string;
    targetId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    await db.insert(systemLogs).values(data);
  },
};
