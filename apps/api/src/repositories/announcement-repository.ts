import { eq, sql } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import { announcements, users } from '../../../../shared/db/schema';
import type {
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '../../../../shared/contracts';

export const announcementRepository = {
  async findAll() {
    return db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        type: announcements.type,
        targetRoles: announcements.targetRoles,
        isPublished: announcements.isPublished,
        publishedAt: announcements.publishedAt,
        startsAt: announcements.startsAt,
        endsAt: announcements.endsAt,
        createdBy: users.name,
        createdAt: announcements.createdAt,
      })
      .from(announcements)
      .innerJoin(users, eq(announcements.createdBy, users.id))
      .orderBy(sql`${announcements.createdAt} DESC`);
  },

  async findById(id: string) {
    const result = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
    return result[0] ?? null;
  },

  async create(data: CreateAnnouncementRequest, createdBy: string) {
    const result = await db
      .insert(announcements)
      .values({
        title: data.title,
        content: data.content,
        type: data.type,
        targetRoles: data.targetRoles,
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? new Date() : null,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        createdBy,
      })
      .returning();
    return result[0]!;
  },

  async update(id: string, data: UpdateAnnouncementRequest) {
    const setData: Record<string, unknown> = { ...data, updatedAt: new Date() };
    if (data.isPublished === true) {
      setData.publishedAt = new Date();
    }
    if (data.startsAt) setData.startsAt = new Date(data.startsAt);
    if (data.endsAt) setData.endsAt = new Date(data.endsAt);

    const result = await db
      .update(announcements)
      .set(setData)
      .where(eq(announcements.id, id))
      .returning();
    return result[0] ?? null;
  },

  async delete(id: string) {
    await db.delete(announcements).where(eq(announcements.id, id));
  },
};
