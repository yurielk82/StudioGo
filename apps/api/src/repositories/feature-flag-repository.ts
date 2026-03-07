import { eq } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import { featureFlags } from '../../../../shared/db/schema';
import type { UpdateFeatureFlagRequest } from '../../../../shared/contracts';

export const featureFlagRepository = {
  async findAll() {
    return db.select().from(featureFlags).orderBy(featureFlags.key);
  },

  async findByKey(key: string) {
    const result = await db.select().from(featureFlags).where(eq(featureFlags.key, key)).limit(1);
    return result[0] ?? null;
  },

  async update(key: string, data: UpdateFeatureFlagRequest) {
    const result = await db
      .update(featureFlags)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(featureFlags.key, key))
      .returning();
    return result[0] ?? null;
  },
};
