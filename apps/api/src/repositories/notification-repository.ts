import { eq, and, sql, lte } from 'drizzle-orm';
import { db } from '@db';
import { notificationJobs, notificationLogs, appNotifications } from '@db/schema';
import type { NotificationEventType, NotificationJobStatus } from '@studiogo/shared/contracts';

export const notificationRepository = {
  async createJob(data: {
    eventType: NotificationEventType;
    payload: Record<string, unknown>;
    idempotencyKey: string;
    scheduledAt?: Date;
    relatedReservationId?: string;
  }) {
    const result = await db
      .insert(notificationJobs)
      .values({
        eventType: data.eventType,
        payload: data.payload,
        idempotencyKey: data.idempotencyKey,
        scheduledAt: data.scheduledAt ?? new Date(),
        relatedReservationId: data.relatedReservationId,
      })
      .onConflictDoNothing({ target: notificationJobs.idempotencyKey })
      .returning();

    return result[0] ?? null;
  },

  async findPendingJobs(limit: number) {
    return db
      .select()
      .from(notificationJobs)
      .where(
        and(
          eq(notificationJobs.status, 'PENDING'),
          lte(notificationJobs.scheduledAt, new Date()),
        ),
      )
      .orderBy(notificationJobs.scheduledAt)
      .limit(limit);
  },

  async updateJobStatus(
    id: string,
    status: NotificationJobStatus,
    extra?: { errorMessage?: string; processedAt?: Date },
  ) {
    await db
      .update(notificationJobs)
      .set({
        status,
        ...(extra?.errorMessage ? { errorMessage: extra.errorMessage } : {}),
        ...(extra?.processedAt ? { processedAt: extra.processedAt } : {}),
        ...(status === 'FAILED'
          ? { retryCount: sql`${notificationJobs.retryCount} + 1` }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(notificationJobs.id, id));
  },

  async createLog(data: {
    notificationSettingId?: string;
    recipientId?: string;
    recipientPhone?: string;
    eventType: NotificationEventType;
    templateCode?: string;
    content?: string;
    status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
    relatedReservationId?: string;
    failedReason?: string;
  }) {
    await db.insert(notificationLogs).values(data);
  },

  async createAppNotification(data: {
    userId: string;
    title: string;
    body: string;
    type: string;
    data?: Record<string, unknown>;
  }) {
    await db.insert(appNotifications).values(data);
  },

  async getAppNotifications(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(appNotifications)
        .where(eq(appNotifications.userId, userId))
        .orderBy(sql`${appNotifications.createdAt} DESC`)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(appNotifications)
        .where(eq(appNotifications.userId, userId)),
    ]);

    return { items, total: countResult[0]?.count ?? 0 };
  },

  async markAsRead(id: string, userId: string) {
    await db
      .update(appNotifications)
      .set({ isRead: true, readAt: new Date(), updatedAt: new Date() })
      .where(
        and(eq(appNotifications.id, id), eq(appNotifications.userId, userId)),
      );
  },

  async markAllAsRead(userId: string) {
    await db
      .update(appNotifications)
      .set({ isRead: true, readAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(appNotifications.userId, userId),
          eq(appNotifications.isRead, false),
        ),
      );
  },
};
