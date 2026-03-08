import { eq } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import { additionalServices } from '../../../../shared/db/schema';
import { firstRow } from '../lib/db-utils';
import type { CreateServiceRequest, UpdateServiceRequest } from '../../../../shared/contracts';

export const serviceRepository = {
  async findAll(onlyActive = false) {
    const query = db
      .select()
      .from(additionalServices)
      .orderBy(additionalServices.sortOrder, additionalServices.name);

    if (onlyActive) {
      return query.where(eq(additionalServices.isActive, true));
    }
    return query;
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(additionalServices)
      .where(eq(additionalServices.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  async create(data: CreateServiceRequest) {
    const result = await db
      .insert(additionalServices)
      .values({
        name: data.name,
        description: data.description,
        icon: data.icon,
        requiresQuantity: data.requiresQuantity,
        requiresMemo: data.requiresMemo,
        sortOrder: data.sortOrder,
      })
      .returning();
    return firstRow(result);
  },

  async update(id: string, data: UpdateServiceRequest) {
    const result = await db
      .update(additionalServices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(additionalServices.id, id))
      .returning();
    return result[0] ?? null;
  },

  async delete(id: string) {
    await db.delete(additionalServices).where(eq(additionalServices.id, id));
  },
};
