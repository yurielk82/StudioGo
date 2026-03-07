import { z } from 'zod';
import { TimeSlotStatus, SlotHoldStatus } from '../enums';

// ── 슬롯 조회 ──────────────────────────────────

export const SlotListQuerySchema = z.object({
  date: z.string().date(),
  studioId: z.string().uuid().optional(),
});
export type SlotListQuery = z.infer<typeof SlotListQuerySchema>;

// ── Hold 생성 ──────────────────────────────────

export const CreateHoldRequestSchema = z.object({
  timeSlotId: z.string().uuid(),
});
export type CreateHoldRequest = z.infer<typeof CreateHoldRequestSchema>;

// ── 슬롯 (재)생성 (ADMIN) ──────────────────────

export const GenerateSlotsRequestSchema = z.object({
  studioId: z.string().uuid(),
  startDate: z.string().date(),
  endDate: z.string().date(),
});
export type GenerateSlotsRequest = z.infer<typeof GenerateSlotsRequestSchema>;

// ── 슬롯 응답 ──────────────────────────────────

export const TimeSlotSchema = z.object({
  id: z.string().uuid(),
  studioId: z.string().uuid(),
  date: z.string().date(),
  startTime: z.string(),
  endTime: z.string(),
  cleaningEndTime: z.string().nullable(),
  status: TimeSlotStatus,
  blockedReason: z.string().nullable(),
});
export type TimeSlot = z.infer<typeof TimeSlotSchema>;

export const SlotAvailabilitySchema = z.object({
  date: z.string().date(),
  studioId: z.string().uuid(),
  studioName: z.string(),
  slots: z.array(TimeSlotSchema),
  availableCount: z.number().int(),
  totalCount: z.number().int(),
});
export type SlotAvailability = z.infer<typeof SlotAvailabilitySchema>;

// ── Hold 응답 ──────────────────────────────────

export const HoldResponseSchema = z.object({
  holdToken: z.string().uuid(),
  timeSlotId: z.string().uuid(),
  expiresAt: z.string().datetime(),
  status: SlotHoldStatus,
});
export type HoldResponse = z.infer<typeof HoldResponseSchema>;
