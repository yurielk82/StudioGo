import { z } from 'zod';

// ── 스튜디오 CRUD ──────────────────────────────

export const CreateStudioRequestSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  capacity: z.number().int().positive(),
  equipment: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  sortOrder: z.number().int().nonnegative().default(0),
});
export type CreateStudioRequest = z.infer<typeof CreateStudioRequestSchema>;

export const UpdateStudioRequestSchema = CreateStudioRequestSchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateStudioRequest = z.infer<typeof UpdateStudioRequestSchema>;

// ── 스튜디오 응답 ──────────────────────────────

export const StudioSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  capacity: z.number().int(),
  equipment: z.array(z.string()),
  images: z.array(z.string()),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.string().datetime(),
});
export type Studio = z.infer<typeof StudioSchema>;

export const StudioWithAvailabilitySchema = StudioSchema.extend({
  availableSlots: z.number().int(),
  totalSlots: z.number().int(),
});
export type StudioWithAvailability = z.infer<typeof StudioWithAvailabilitySchema>;
