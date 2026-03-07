import { z } from 'zod';
import { UserRole, UserStatus, Tier } from '../enums';

// ── 회원 목록 필터 ──────────────────────────────

export const MemberListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: UserStatus.optional(),
  tier: Tier.optional(),
  role: UserRole.optional(),
  search: z.string().max(100).optional(),
});
export type MemberListQuery = z.infer<typeof MemberListQuerySchema>;

// ── 회원 응답 ──────────────────────────────────

export const MemberSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  nickname: z.string(),
  profileImage: z.string().url().nullable(),
  tier: Tier,
  role: UserRole,
  status: UserStatus,
  totalBroadcasts: z.number().int(),
  createdAt: z.string().datetime(),
});
export type MemberSummary = z.infer<typeof MemberSummarySchema>;

export const MemberDetailSchema = MemberSummarySchema.extend({
  email: z.string().email().nullable(),
  phone: z.string(),
  bankName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  accountHolder: z.string().nullable(),
  approvedAt: z.string().datetime().nullable(),
  memo: z.string().nullable(),
  lastLoginAt: z.string().datetime().nullable(),
});
export type MemberDetail = z.infer<typeof MemberDetailSchema>;

// ── 회원 정보 수정 (ADMIN) ──────────────────────

export const UpdateMemberRequestSchema = z.object({
  name: z.string().min(2).max(20).optional(),
  nickname: z.string().min(2).max(20).optional(),
  memo: z.string().max(500).optional(),
  role: UserRole.optional(),
  tier: Tier.optional(),
});
export type UpdateMemberRequest = z.infer<typeof UpdateMemberRequestSchema>;

// ── 회원 정지 ──────────────────────────────────

export const SuspendMemberRequestSchema = z.object({
  reason: z.string().min(1).max(500),
});
export type SuspendMemberRequest = z.infer<typeof SuspendMemberRequestSchema>;
