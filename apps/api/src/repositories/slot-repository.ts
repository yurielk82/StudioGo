import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import { timeSlots, slotHolds } from '../../../../shared/db/schema';
import type { TimeSlotStatus } from '../../../../shared/contracts';

export const slotRepository = {
  async findById(id: string) {
    const result = await db.select().from(timeSlots).where(eq(timeSlots.id, id)).limit(1);
    return result[0] ?? null;
  },

  async findByDateAndStudio(date: string, studioId?: string) {
    const conditions = [eq(timeSlots.date, date)];
    if (studioId) {
      conditions.push(eq(timeSlots.studioId, studioId));
    }

    return db
      .select()
      .from(timeSlots)
      .where(and(...conditions))
      .orderBy(timeSlots.startTime);
  },

  async updateStatus(id: string, status: TimeSlotStatus, blockedReason?: string) {
    await db
      .update(timeSlots)
      .set({
        status,
        ...(blockedReason !== undefined ? { blockedReason } : {}),
        updatedAt: new Date(),
      })
      .where(eq(timeSlots.id, id));
  },

  async bulkInsert(
    slots: Array<{
      studioId: string;
      date: string;
      startTime: string;
      endTime: string;
      cleaningEndTime: string;
      status?: TimeSlotStatus;
    }>,
  ) {
    if (slots.length === 0) return;

    await db.insert(timeSlots).values(
      slots.map((s) => ({
        ...s,
        status: s.status ?? ('AVAILABLE' as const),
      })),
    );
  },

  async deleteAvailableByDateRange(studioId: string, startDate: string, endDate: string) {
    await db
      .delete(timeSlots)
      .where(
        and(
          eq(timeSlots.studioId, studioId),
          eq(timeSlots.status, 'AVAILABLE'),
          sql`${timeSlots.date} >= ${startDate}`,
          sql`${timeSlots.date} <= ${endDate}`,
        ),
      );
  },

  // ── Hold 관련 ──────────────────────────────────

  async createHold(data: { timeSlotId: string; userId: string; expiresAt: Date }) {
    // ACTIVE hold가 같은 슬롯에 이미 있는지 확인
    const existing = await db
      .select()
      .from(slotHolds)
      .where(and(eq(slotHolds.timeSlotId, data.timeSlotId), eq(slotHolds.status, 'ACTIVE')))
      .limit(1);

    if (existing.length > 0) return null;

    const result = await db
      .insert(slotHolds)
      .values({
        timeSlotId: data.timeSlotId,
        userId: data.userId,
        expiresAt: data.expiresAt,
        status: 'ACTIVE',
      })
      .returning();

    return result[0]!;
  },

  async findHoldByToken(holdToken: string) {
    const result = await db
      .select()
      .from(slotHolds)
      .where(eq(slotHolds.holdToken, holdToken))
      .limit(1);
    return result[0] ?? null;
  },

  async consumeHold(holdToken: string) {
    await db
      .update(slotHolds)
      .set({ status: 'CONSUMED', updatedAt: new Date() })
      .where(and(eq(slotHolds.holdToken, holdToken), eq(slotHolds.status, 'ACTIVE')));
  },

  async expireHolds() {
    const result = await db
      .update(slotHolds)
      .set({ status: 'EXPIRED', updatedAt: new Date() })
      .where(and(eq(slotHolds.status, 'ACTIVE'), sql`${slotHolds.expiresAt} < now()`))
      .returning({ id: slotHolds.id });

    return result.length;
  },

  async cancelHold(holdToken: string, userId: string) {
    await db
      .update(slotHolds)
      .set({ status: 'CANCELLED', updatedAt: new Date() })
      .where(
        and(
          eq(slotHolds.holdToken, holdToken),
          eq(slotHolds.userId, userId),
          eq(slotHolds.status, 'ACTIVE'),
        ),
      );
  },
};
