import { z } from 'zod';
import { SessionStatus } from '../enums';

/**
 * Session validation schemas
 */

export const createSessionSchema = z.object({
  cabId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  scheduledAt: z.date(),
  duration: z.number().int().min(15).max(480).default(60), // 15 min to 8 hours
  meetingLink: z.string().url().optional(),
  agendaItems: z.array(
    z.object({
      title: z.string(),
      duration: z.number().int().min(1),
      completed: z.boolean().default(false),
    })
  ).optional(),
});

export const updateSessionSchema = createSessionSchema.partial();

export const updateSessionStatusSchema = z.object({
  status: z.nativeEnum(SessionStatus),
  endedAt: z.date().optional(),
});

export const addSessionMinutesSchema = z.object({
  summary: z.string().min(1),
  decisions: z.array(z.string()),
  notes: z.string().optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type UpdateSessionStatusInput = z.infer<typeof updateSessionStatusSchema>;
export type AddSessionMinutesInput = z.infer<typeof addSessionMinutesSchema>;
