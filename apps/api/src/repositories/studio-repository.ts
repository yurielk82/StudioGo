import { eq, sql } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import { studios } from '../../../../shared/db/schema';
import type { CreateStudioRequest, UpdateStudioRequest } from '../../../../shared/contracts';

export const studioRepository = {
  async findAll(onlyActive = false) {
    const query = db.select().from(studios).orderBy(studios.sortOrder, studios.name);

    if (onlyActive) {
      return query.where(eq(studios.isActive, true));
    }
    return query;
  },

  async findById(id: string) {
    const result = await db.select().from(studios).where(eq(studios.id, id)).limit(1);
    return result[0] ?? null;
  },

  async create(data: CreateStudioRequest) {
    const result = await db
      .insert(studios)
      .values({
        name: data.name,
        description: data.description,
        capacity: data.capacity,
        equipment: data.equipment,
        images: data.images,
        sortOrder: data.sortOrder,
      })
      .returning();
    return result[0]!;
  },

  async update(id: string, data: UpdateStudioRequest) {
    const result = await db
      .update(studios)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(studios.id, id))
      .returning();
    return result[0] ?? null;
  },

  async softDelete(id: string) {
    await db
      .update(studios)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(studios.id, id));
  },

  async toggleActive(id: string) {
    const result = await db
      .update(studios)
      .set({
        isActive: sql`NOT ${studios.isActive}`,
        updatedAt: new Date(),
      })
      .where(eq(studios.id, id))
      .returning();
    return result[0] ?? null;
  },
};
