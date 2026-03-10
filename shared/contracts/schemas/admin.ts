import { z } from 'zod';
import { BlackoutType, AnnouncementType, UserRole } from '../enums';

// ── 운영 설정 ──────────────────────────────────

export const UpdateSettingRequestSchema = z.object({
  value: z.unknown(),
});
export type UpdateSettingRequest = z.infer<typeof UpdateSettingRequestSchema>;

export const OperationSettingSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  value: z.unknown(),
  description: z.string().nullable(),
  category: z.string().nullable(),
});
export type OperationSetting = z.infer<typeof OperationSettingSchema>;

// ── Blackout ──────────────────────────────────

export const CreateBlackoutRequestSchema = z.object({
  studioId: z.string().uuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  reason: z.string().min(1).max(500),
  type: BlackoutType,
  repeatRule: z
    .object({
      frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
      interval: z.number().int().positive().default(1),
      until: z.string().date().optional(),
    })
    .nullable()
    .default(null),
  force: z.boolean().default(false),
});
export type CreateBlackoutRequest = z.infer<typeof CreateBlackoutRequestSchema>;

export const BlackoutSchema = z.object({
  id: z.string().uuid(),
  studioId: z.string().uuid(),
  studioName: z.string(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  reason: z.string(),
  type: BlackoutType,
  repeatRule: z
    .object({
      frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
      interval: z.number().int(),
      until: z.string().date().optional(),
    })
    .nullable(),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
});
export type Blackout = z.infer<typeof BlackoutSchema>;

// ── 티어 설정 ──────────────────────────────────

export const TierConfigSchema = z.object({
  thresholds: z.object({
    SILVER: z.number().int().positive(),
    GOLD: z.number().int().positive(),
    PLATINUM: z.number().int().positive(),
    DIAMOND: z.number().int().positive(),
  }),
  autoApproveGoldAbove: z.boolean(),
});
export type TierConfig = z.infer<typeof TierConfigSchema>;

export const UpdateTierConfigRequestSchema = TierConfigSchema.partial();
export type UpdateTierConfigRequest = z.infer<typeof UpdateTierConfigRequestSchema>;

// ── 부가서비스 ──────────────────────────────────

export const CreateServiceRequestSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  requiresQuantity: z.boolean().default(false),
  requiresMemo: z.boolean().default(false),
  sortOrder: z.number().int().nonnegative().default(0),
});
export type CreateServiceRequest = z.infer<typeof CreateServiceRequestSchema>;

export const UpdateServiceRequestSchema = CreateServiceRequestSchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateServiceRequest = z.infer<typeof UpdateServiceRequestSchema>;

export const AdditionalServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  isActive: z.boolean(),
  requiresQuantity: z.boolean(),
  requiresMemo: z.boolean(),
  sortOrder: z.number().int(),
});
export type AdditionalService = z.infer<typeof AdditionalServiceSchema>;

// ── 공지 ──────────────────────────────────────

export const CreateAnnouncementRequestSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
  type: AnnouncementType,
  targetRoles: z.array(UserRole).min(1),
  isPublished: z.boolean().default(false),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});
export type CreateAnnouncementRequest = z.infer<typeof CreateAnnouncementRequestSchema>;

export const UpdateAnnouncementRequestSchema = CreateAnnouncementRequestSchema.partial();
export type UpdateAnnouncementRequest = z.infer<typeof UpdateAnnouncementRequestSchema>;

export const AnnouncementSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  type: AnnouncementType,
  targetRoles: z.array(UserRole),
  isPublished: z.boolean(),
  publishedAt: z.string().datetime().nullable(),
  startsAt: z.string().datetime().nullable(),
  endsAt: z.string().datetime().nullable(),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
});
export type Announcement = z.infer<typeof AnnouncementSchema>;

// ── Feature Flags ──────────────────────────────

export const UpdateFeatureFlagRequestSchema = z.object({
  enabled: z.boolean(),
  description: z.string().max(200).optional(),
  scope: z.record(z.string(), z.unknown()).nullable().optional(),
});
export type UpdateFeatureFlagRequest = z.infer<typeof UpdateFeatureFlagRequestSchema>;

export const FeatureFlagSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  enabled: z.boolean(),
  description: z.string().nullable(),
  scope: z.record(z.string(), z.unknown()).nullable(),
});
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;

// ── 시스템 로그 ──────────────────────────────────

export const SystemLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});
export type SystemLogQuery = z.infer<typeof SystemLogQuerySchema>;

export const SystemLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  userName: z.string().nullable(),
  action: z.string(),
  target: z.string(),
  targetId: z.string().nullable(),
  details: z.record(z.string(), z.unknown()).nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type SystemLog = z.infer<typeof SystemLogSchema>;

// ── 운영자 권한 ──────────────────────────────────

export const OperatorPermissionsSchema = z.object({
  userId: z.string().uuid(),
  userName: z.string(),
  canApproveReservation: z.boolean(),
  canRejectReservation: z.boolean(),
  canManageMembers: z.boolean(),
  canApproveMember: z.boolean(),
  canManageStudios: z.boolean(),
  canViewStatistics: z.boolean(),
  canSendNotification: z.boolean(),
  canManageServices: z.boolean(),
});
export type OperatorPermissions = z.infer<typeof OperatorPermissionsSchema>;

export const UpdatePermissionsRequestSchema = z.object({
  canApproveReservation: z.boolean().optional(),
  canRejectReservation: z.boolean().optional(),
  canManageMembers: z.boolean().optional(),
  canApproveMember: z.boolean().optional(),
  canManageStudios: z.boolean().optional(),
  canViewStatistics: z.boolean().optional(),
  canSendNotification: z.boolean().optional(),
  canManageServices: z.boolean().optional(),
});
export type UpdatePermissionsRequest = z.infer<typeof UpdatePermissionsRequestSchema>;
