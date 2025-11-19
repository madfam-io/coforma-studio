import { z } from 'zod';
import { SessionStatus } from '@prisma/client';

/**
 * DTO schemas for session operations
 * Using Zod for runtime validation
 */

// Base session response schema
export const sessionResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  cabId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.nativeEnum(SessionStatus),
  scheduledAt: z.date(),
  duration: z.number().int(),
  endedAt: z.date().nullable(),
  meetingLink: z.string().nullable(),
  recordingUrl: z.string().nullable(),
  agendaItems: z.any().nullable(), // JSON type
  createdAt: z.date(),
  updatedAt: z.date(),
  // Include CAB data
  cab: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
  }).optional(),
  // Include counts
  _count: z.object({
    attendees: z.number().int(),
    feedbackItems: z.number().int(),
    actionItems: z.number().int(),
  }).optional(),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;

// Create session input schema
export const createSessionSchema = z.object({
  cabId: z.string().uuid(),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  scheduledAt: z.coerce.date(),
  duration: z.number().int().positive().max(480).default(60), // Max 8 hours
  meetingLink: z.string().url().optional(),
  agendaItems: z.array(
    z.object({
      title: z.string().min(1).max(200),
      duration: z.number().int().positive().optional(),
      completed: z.boolean().default(false),
    })
  ).optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

// Update session input schema
export const updateSessionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.nativeEnum(SessionStatus).optional(),
  scheduledAt: z.coerce.date().optional(),
  duration: z.number().int().positive().max(480).optional(),
  endedAt: z.coerce.date().nullable().optional(),
  meetingLink: z.string().url().nullable().optional(),
  recordingUrl: z.string().url().nullable().optional(),
  agendaItems: z.array(
    z.object({
      title: z.string().min(1).max(200),
      duration: z.number().int().positive().optional(),
      completed: z.boolean().default(false),
    })
  ).nullable().optional(),
});

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

// List sessions query schema
export const listSessionsSchema = z.object({
  cabId: z.string().uuid(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
  status: z.nativeEnum(SessionStatus).optional(),
  startDate: z.coerce.date().optional(), // Filter sessions after this date
  endDate: z.coerce.date().optional(),   // Filter sessions before this date
  orderBy: z.enum(['scheduledAt', 'createdAt', 'title']).default('scheduledAt'),
  orderDirection: z.enum(['asc', 'desc']).default('desc'),
});

export type ListSessionsInput = z.infer<typeof listSessionsSchema>;

// List sessions response schema
export const listSessionsResponseSchema = z.object({
  sessions: z.array(sessionResponseSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});

export type ListSessionsResponse = z.infer<typeof listSessionsResponseSchema>;

// Get session by ID input schema
export const getSessionByIdSchema = z.object({
  id: z.string().uuid(),
});

export type GetSessionByIdInput = z.infer<typeof getSessionByIdSchema>;

// Delete session input schema
export const deleteSessionSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteSessionInput = z.infer<typeof deleteSessionSchema>;
