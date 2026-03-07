import { z } from 'zod';
import { TimeSlotStatus, ReservationStatus } from '../enums';

// ── 월간 캘린더 ──────────────────────────────

export const MonthlyCalendarQuerySchema = z.object({
  year: z.coerce.number().int().min(2024).max(2030),
  month: z.coerce.number().int().min(1).max(12),
  studioId: z.string().uuid().optional(),
});
export type MonthlyCalendarQuery = z.infer<typeof MonthlyCalendarQuerySchema>;

export const MonthlyDaySchema = z.object({
  date: z.string().date(),
  totalSlots: z.number().int(),
  availableSlots: z.number().int(),
  reservedSlots: z.number().int(),
  blockedSlots: z.number().int(),
  isBlackout: z.boolean(),
  hasMyReservation: z.boolean(),
});
export type MonthlyDay = z.infer<typeof MonthlyDaySchema>;

// ── 주간 캘린더 ──────────────────────────────

export const WeeklyCalendarQuerySchema = z.object({
  date: z.string().date(),
  studioId: z.string().uuid().optional(),
});
export type WeeklyCalendarQuery = z.infer<typeof WeeklyCalendarQuerySchema>;

export const WeeklySlotBlockSchema = z.object({
  id: z.string().uuid(),
  studioId: z.string().uuid(),
  studioName: z.string(),
  date: z.string().date(),
  startTime: z.string(),
  endTime: z.string(),
  cleaningEndTime: z.string().nullable(),
  status: TimeSlotStatus,
  reservation: z
    .object({
      id: z.string().uuid(),
      reservationNumber: z.string(),
      userName: z.string(),
      userNickname: z.string(),
      status: ReservationStatus,
    })
    .nullable(),
});
export type WeeklySlotBlock = z.infer<typeof WeeklySlotBlockSchema>;

// ── 일간 캘린더 ──────────────────────────────

export const DailyCalendarQuerySchema = z.object({
  date: z.string().date(),
  studioId: z.string().uuid().optional(),
});
export type DailyCalendarQuery = z.infer<typeof DailyCalendarQuerySchema>;

export const DailyTimelineSchema = z.object({
  studioId: z.string().uuid(),
  studioName: z.string(),
  slots: z.array(WeeklySlotBlockSchema),
});
export type DailyTimeline = z.infer<typeof DailyTimelineSchema>;
