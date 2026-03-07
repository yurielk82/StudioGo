import { db } from '../../../../shared/db/index';
import { systemLogs } from '../../../../shared/db/schema';

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
