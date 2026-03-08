import { eq, sql } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import { studioBlackouts, studios, users } from '../../../../shared/db/schema';
import { firstRow } from '../lib/db-utils';
import type { CreateBlackoutRequest } from '../../../../shared/contracts';

export const blackoutRepository = {
  async findAll() {
    return db
      .select({
        id: studioBlackouts.id,
        studioId: studioBlackouts.studioId,
        studioName: studios.name,
        startAt: studioBlackouts.startAt,
        endAt: studioBlackouts.endAt,
        reason: studioBlackouts.reason,
        type: studioBlackouts.type,
        repeatRule: studioBlackouts.repeatRule,
        createdBy: users.name,
        createdAt: studioBlackouts.createdAt,
      })
      .from(studioBlackouts)
      .innerJoin(studios, eq(studioBlackouts.studioId, studios.id))
      .innerJoin(users, eq(studioBlackouts.createdBy, users.id))
      .orderBy(sql`${studioBlackouts.startAt} DESC`);
  },

  async create(data: CreateBlackoutRequest, createdBy: string) {
    const result = await db
      .insert(studioBlackouts)
      .values({
        studioId: data.studioId,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
        reason: data.reason,
        type: data.type,
        repeatRule: data.repeatRule,
        createdBy,
      })
      .returning();
    return firstRow(result);
  },

  async delete(id: string) {
    await db.delete(studioBlackouts).where(eq(studioBlackouts.id, id));
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(studioBlackouts)
      .where(eq(studioBlackouts.id, id))
      .limit(1);
    return result[0] ?? null;
  },
};
