import { z } from 'zod';

export const createSessionSchema = z.object({
  cabId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  scheduledAt: z.date().or(z.string()),
  duration: z.number().int().positive().default(60),
  meetingLink: z.string().url().optional(),
  agendaItems: z.array(
    z.object({
      title: z.string().min(1),
      duration: z.number().int().positive(),
      completed: z.boolean().default(false),
    })
  ).optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const updateSessionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  scheduledAt: z.date().or(z.string()).optional(),
  duration: z.number().int().positive().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  meetingLink: z.string().url().optional(),
  recordingUrl: z.string().url().optional(),
  agendaItems: z.array(
    z.object({
      title: z.string().min(1),
      duration: z.number().int().positive(),
      completed: z.boolean(),
    })
  ).optional(),
});

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
