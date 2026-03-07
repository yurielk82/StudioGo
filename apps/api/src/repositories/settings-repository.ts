import { eq } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import { operationSettings } from '../../../../shared/db/schema';
import type { SettingsKey, SettingsMap } from '../../../../shared/domain/settings';
import { SETTINGS_DEFAULTS, parseSettingValue } from '../../../../shared/domain/settings';

export const settingsRepository = {
  async get<K extends SettingsKey>(key: K): Promise<SettingsMap[K]> {
    const result = await db
      .select()
      .from(operationSettings)
      .where(eq(operationSettings.key, key))
      .limit(1);

    const row = result[0];
    if (!row) return SETTINGS_DEFAULTS[key];

    return parseSettingValue(key, row.value);
  },

  async getAll(): Promise<
    Array<{ key: string; value: unknown; description: string | null; category: string | null }>
  > {
    return db.select().from(operationSettings);
  },

  async set(key: string, value: unknown): Promise<void> {
    await db
      .update(operationSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(operationSettings.key, key));
  },
};
