import { z } from 'zod';
import { WaitlistStatus } from '../enums';

// ── 대기 등록 ──────────────────────────────────

export const CreateWaitlistRequestSchema = z.object({
  studioId: z.string().uuid().optional(),
  date: z.string().date(),
  preferredTimeRange: z
    .object({
      startTime: z.string(),
      endTime: z.string(),
    })
    .nullable()
    .default(null),
});
export type CreateWaitlistRequest = z.infer<typeof CreateWaitlistRequestSchema>;

// ── 대기 응답 ──────────────────────────────────

export const WaitlistEntrySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  studioId: z.string().uuid().nullable(),
  studioName: z.string().nullable(),
  date: z.string().date(),
  preferredTimeRange: z
    .object({
      startTime: z.string(),
      endTime: z.string(),
    })
    .nullable(),
  status: WaitlistStatus,
  priority: z.number().int(),
  notifiedAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type WaitlistEntry = z.infer<typeof WaitlistEntrySchema>;
