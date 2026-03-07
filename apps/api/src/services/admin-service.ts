import { settingsRepository } from '../repositories/settings-repository';
import { blackoutRepository } from '../repositories/blackout-repository';
import { serviceRepository } from '../repositories/service-repository';
import { announcementRepository } from '../repositories/announcement-repository';
import { featureFlagRepository } from '../repositories/feature-flag-repository';
import { systemLogRepository } from '../repositories/system-log-repository';
import { userRepository } from '../repositories/user-repository';
import { ApiError } from '../lib/api-error';
import { calculateTier } from '../../../../shared/domain/tier';
import type {
  CreateBlackoutRequest,
  CreateServiceRequest,
  UpdateServiceRequest,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  UpdateFeatureFlagRequest,
  SystemLogQuery,
} from '../../../../shared/contracts';
import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import { systemLogs, users, operatorPermissions } from '../../../../shared/db/schema';

export const adminService = {
  // ── 운영 설정 ──────────────────────────────────

  async getSettings() {
    return settingsRepository.getAll();
  },

  async updateSetting(key: string, value: unknown, adminId: string) {
    await settingsRepository.set(key, value);

    await systemLogRepository.create({
      userId: adminId,
      action: 'SETTING_UPDATE',
      target: 'operation_settings',
      targetId: key,
      details: { value },
    });
  },

  // ── Blackout ──────────────────────────────────

  async getBlackouts() {
    return blackoutRepository.findAll();
  },

  async createBlackout(data: CreateBlackoutRequest, adminId: string) {
    const blackout = await blackoutRepository.create(data, adminId);

    await systemLogRepository.create({
      userId: adminId,
      action: 'BLACKOUT_CREATE',
      target: 'studio_blackouts',
      targetId: blackout.id,
      details: { studioId: data.studioId, reason: data.reason },
    });

    return blackout;
  },

  async deleteBlackout(id: string, adminId: string) {
    const existing = await blackoutRepository.findById(id);
    if (!existing) throw ApiError.notFound('BLACKOUT_NOT_FOUND', 'Blackout을 찾을 수 없습니다.');

    await blackoutRepository.delete(id);

    await systemLogRepository.create({
      userId: adminId,
      action: 'BLACKOUT_DELETE',
      target: 'studio_blackouts',
      targetId: id,
    });
  },

  // ── 티어 ──────────────────────────────────────

  async getTierConfig() {
    const [thresholds, autoApprove] = await Promise.all([
      settingsRepository.get('tier_thresholds'),
      settingsRepository.get('auto_approve_gold_above'),
    ]);
    return { thresholds, autoApproveGoldAbove: autoApprove };
  },

  async updateTierConfig(
    data: { thresholds?: Record<string, number>; autoApproveGoldAbove?: boolean },
    adminId: string,
  ) {
    if (data.thresholds) {
      await settingsRepository.set('tier_thresholds', data.thresholds);
    }
    if (data.autoApproveGoldAbove !== undefined) {
      await settingsRepository.set('auto_approve_gold_above', data.autoApproveGoldAbove);
    }

    await systemLogRepository.create({
      userId: adminId,
      action: 'TIER_CONFIG_UPDATE',
      target: 'operation_settings',
      details: data,
    });
  },

  async recalculateTiers(adminId: string) {
    const thresholds = await settingsRepository.get('tier_thresholds');
    const allUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.status, 'APPROVED'));

    let updated = 0;
    for (const u of allUsers) {
      const broadcastCount = await userRepository.getBroadcastCount(u.id);
      const newTier = calculateTier(broadcastCount, thresholds);
      await userRepository.updateTier(u.id, newTier);
      updated++;
    }

    await systemLogRepository.create({
      userId: adminId,
      action: 'TIER_RECALCULATE',
      target: 'users',
      details: { updatedCount: updated },
    });

    return { updated };
  },

  // ── 부가서비스 ──────────────────────────────────

  async getServices() {
    return serviceRepository.findAll();
  },

  async createService(data: CreateServiceRequest, adminId: string) {
    const service = await serviceRepository.create(data);

    await systemLogRepository.create({
      userId: adminId,
      action: 'SERVICE_CREATE',
      target: 'additional_services',
      targetId: service.id,
      details: { name: data.name },
    });

    return service;
  },

  async updateService(id: string, data: UpdateServiceRequest, adminId: string) {
    const existing = await serviceRepository.findById(id);
    if (!existing) throw ApiError.notFound('SERVICE_NOT_FOUND', '부가서비스를 찾을 수 없습니다.');

    const updated = await serviceRepository.update(id, data);

    await systemLogRepository.create({
      userId: adminId,
      action: 'SERVICE_UPDATE',
      target: 'additional_services',
      targetId: id,
      details: data,
    });

    return updated;
  },

  async deleteService(id: string, adminId: string) {
    const existing = await serviceRepository.findById(id);
    if (!existing) throw ApiError.notFound('SERVICE_NOT_FOUND', '부가서비스를 찾을 수 없습니다.');

    await serviceRepository.delete(id);

    await systemLogRepository.create({
      userId: adminId,
      action: 'SERVICE_DELETE',
      target: 'additional_services',
      targetId: id,
    });
  },

  // ── 시스템 로그 ──────────────────────────────────

  async getLogs(query: SystemLogQuery) {
    const { page, limit, userId, action, startDate, endDate } = query;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (userId) conditions.push(eq(systemLogs.userId, userId));
    if (action) conditions.push(eq(systemLogs.action, action));
    if (startDate) conditions.push(sql`${systemLogs.createdAt} >= ${startDate}::date`);
    if (endDate)
      conditions.push(sql`${systemLogs.createdAt} < (${endDate}::date + interval '1 day')`);

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: systemLogs.id,
          userId: systemLogs.userId,
          userName: users.name,
          action: systemLogs.action,
          target: systemLogs.target,
          targetId: systemLogs.targetId,
          details: systemLogs.details,
          ipAddress: systemLogs.ipAddress,
          createdAt: systemLogs.createdAt,
        })
        .from(systemLogs)
        .leftJoin(users, eq(systemLogs.userId, users.id))
        .where(where)
        .orderBy(desc(systemLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(systemLogs)
        .where(where),
    ]);

    return { items, total: countResult[0]?.count ?? 0 };
  },

  // ── Feature Flags ──────────────────────────────

  async getFeatureFlags() {
    return featureFlagRepository.findAll();
  },

  async updateFeatureFlag(key: string, data: UpdateFeatureFlagRequest, adminId: string) {
    const existing = await featureFlagRepository.findByKey(key);
    if (!existing) throw ApiError.notFound('GENERAL_NOT_FOUND', 'Feature flag를 찾을 수 없습니다.');

    const updated = await featureFlagRepository.update(key, data);

    await systemLogRepository.create({
      userId: adminId,
      action: 'FEATURE_FLAG_UPDATE',
      target: 'feature_flags',
      targetId: key,
      details: data,
    });

    return updated;
  },

  // ── 공지사항 ──────────────────────────────────

  async getAnnouncements() {
    return announcementRepository.findAll();
  },

  async createAnnouncement(data: CreateAnnouncementRequest, adminId: string) {
    const announcement = await announcementRepository.create(data, adminId);

    await systemLogRepository.create({
      userId: adminId,
      action: 'ANNOUNCEMENT_CREATE',
      target: 'announcements',
      targetId: announcement.id,
      details: { title: data.title },
    });

    return announcement;
  },

  async updateAnnouncement(id: string, data: UpdateAnnouncementRequest, adminId: string) {
    const existing = await announcementRepository.findById(id);
    if (!existing) throw ApiError.notFound('GENERAL_NOT_FOUND', '공지사항을 찾을 수 없습니다.');

    const updated = await announcementRepository.update(id, data);

    await systemLogRepository.create({
      userId: adminId,
      action: 'ANNOUNCEMENT_UPDATE',
      target: 'announcements',
      targetId: id,
      details: data,
    });

    return updated;
  },

  async deleteAnnouncement(id: string, adminId: string) {
    const existing = await announcementRepository.findById(id);
    if (!existing) throw ApiError.notFound('GENERAL_NOT_FOUND', '공지사항을 찾을 수 없습니다.');

    await announcementRepository.delete(id);

    await systemLogRepository.create({
      userId: adminId,
      action: 'ANNOUNCEMENT_DELETE',
      target: 'announcements',
      targetId: id,
    });
  },

  // ── 운영자 권한 ──────────────────────────────────

  async getPermissions() {
    return db
      .select({
        userId: operatorPermissions.userId,
        userName: users.name,
        canApproveReservation: operatorPermissions.canApproveReservation,
        canRejectReservation: operatorPermissions.canRejectReservation,
        canManageMembers: operatorPermissions.canManageMembers,
        canApproveMember: operatorPermissions.canApproveMember,
        canManageStudios: operatorPermissions.canManageStudios,
        canViewStatistics: operatorPermissions.canViewStatistics,
        canSendNotification: operatorPermissions.canSendNotification,
        canManageServices: operatorPermissions.canManageServices,
      })
      .from(operatorPermissions)
      .innerJoin(users, eq(operatorPermissions.userId, users.id));
  },

  async updatePermissions(userId: string, data: Record<string, boolean>, adminId: string) {
    // UPSERT: 없으면 생성, 있으면 업데이트
    const existing = await db
      .select()
      .from(operatorPermissions)
      .where(eq(operatorPermissions.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(operatorPermissions)
        .set({ ...data, grantedBy: adminId, grantedAt: new Date(), updatedAt: new Date() })
        .where(eq(operatorPermissions.userId, userId));
    } else {
      await db.insert(operatorPermissions).values({
        userId,
        ...data,
        grantedBy: adminId,
      });
    }

    await systemLogRepository.create({
      userId: adminId,
      action: 'PERMISSION_UPDATE',
      target: 'operator_permissions',
      targetId: userId,
      details: data,
    });
  },
};
