import { z } from 'zod';

/**
 * DTO schemas for session attendee operations
 * Using Zod for runtime validation
 */

// Base session attendee response schema
export const sessionAttendeeResponseSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  attended: z.boolean(),
  talkTime: z.number().int().nullable(),
  joinedAt: z.date().nullable(),
  leftAt: z.date().nullable(),
  createdAt: z.date(),
  // Include user data
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().nullable(),
    avatar: z.string().nullable(),
  }),
});

export type SessionAttendeeResponse = z.infer<typeof sessionAttendeeResponseSchema>;

// Add attendee to session input schema
export const addAttendeeSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type AddAttendeeInput = z.infer<typeof addAttendeeSchema>;

// Bulk add attendees input schema
export const bulkAddAttendeesSchema = z.object({
  sessionId: z.string().uuid(),
  userIds: z.array(z.string().uuid()).min(1).max(100),
});

export type BulkAddAttendeesInput = z.infer<typeof bulkAddAttendeesSchema>;

// Update attendee input schema
export const updateAttendeeSchema = z.object({
  id: z.string().uuid(),
  attended: z.boolean().optional(),
  talkTime: z.number().int().positive().nullable().optional(),
  joinedAt: z.coerce.date().nullable().optional(),
  leftAt: z.coerce.date().nullable().optional(),
});

export type UpdateAttendeeInput = z.infer<typeof updateAttendeeSchema>;

// List attendees query schema
export const listAttendeesSchema = z.object({
  sessionId: z.string().uuid(),
  attended: z.boolean().optional(), // Filter by attendance
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

export type ListAttendeesInput = z.infer<typeof listAttendeesSchema>;

// List attendees response schema
export const listAttendeesResponseSchema = z.object({
  attendees: z.array(sessionAttendeeResponseSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});

export type ListAttendeesResponse = z.infer<typeof listAttendeesResponseSchema>;

// Get attendee by ID input schema
export const getAttendeeByIdSchema = z.object({
  id: z.string().uuid(),
});

export type GetAttendeeByIdInput = z.infer<typeof getAttendeeByIdSchema>;

// Remove attendee input schema
export const removeAttendeeSchema = z.object({
  id: z.string().uuid(),
});

export type RemoveAttendeeInput = z.infer<typeof removeAttendeeSchema>;

// Bulk add response schema
export const bulkAddAttendeesResponseSchema = z.object({
  added: z.number().int(),
  attendees: z.array(sessionAttendeeResponseSchema),
});

export type BulkAddAttendeesResponse = z.infer<typeof bulkAddAttendeesResponseSchema>;
