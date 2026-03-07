import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import { fulfillmentTasks, reservations, users } from '../../../../shared/db/schema';
import type { FulfillmentListQuery, UpdateFulfillmentRequest } from '../../../../shared/contracts';

export const fulfillmentRepository = {
  async findAll(query: FulfillmentListQuery) {
    const { page, limit, status, startDate, endDate } = query;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status) conditions.push(eq(fulfillmentTasks.status, status));
    if (startDate) conditions.push(sql`${fulfillmentTasks.createdAt} >= ${startDate}::date`);
    if (endDate)
      conditions.push(sql`${fulfillmentTasks.createdAt} < (${endDate}::date + interval '1 day')`);

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: fulfillmentTasks.id,
          reservationId: fulfillmentTasks.reservationId,
          reservationNumber: reservations.reservationNumber,
          userName: users.name,
          status: fulfillmentTasks.status,
          courier: fulfillmentTasks.courier,
          trackingNumber: fulfillmentTasks.trackingNumber,
          parcelCount: fulfillmentTasks.parcelCount,
          operatorName: users.name,
          memo: fulfillmentTasks.memo,
          shippedAt: fulfillmentTasks.shippedAt,
          completedAt: fulfillmentTasks.completedAt,
          createdAt: fulfillmentTasks.createdAt,
        })
        .from(fulfillmentTasks)
        .innerJoin(reservations, eq(fulfillmentTasks.reservationId, reservations.id))
        .innerJoin(users, eq(reservations.userId, users.id))
        .where(where)
        .orderBy(sql`${fulfillmentTasks.createdAt} DESC`)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(fulfillmentTasks)
        .where(where),
    ]);

    return { items, total: countResult[0]?.count ?? 0 };
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(fulfillmentTasks)
      .where(eq(fulfillmentTasks.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  async update(id: string, data: UpdateFulfillmentRequest, operatorId: string) {
    const setData: Record<string, unknown> = {
      ...data,
      operatorId,
      updatedAt: new Date(),
    };

    if (data.status === 'SHIPPED') setData.shippedAt = new Date();
    if (data.status === 'COMPLETED') setData.completedAt = new Date();

    const result = await db
      .update(fulfillmentTasks)
      .set(setData)
      .where(eq(fulfillmentTasks.id, id))
      .returning();
    return result[0] ?? null;
  },

  async createForReservation(reservationId: string) {
    const result = await db.insert(fulfillmentTasks).values({ reservationId }).returning();
    return result[0]!;
  },
};
