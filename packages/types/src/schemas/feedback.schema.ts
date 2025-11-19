import { z } from 'zod';
import { FeedbackType, FeedbackStatus, FeedbackPriority } from '../enums';

/**
 * Feedback validation schemas
 */

export const createFeedbackSchema = z.object({
  cabId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  type: z.nativeEnum(FeedbackType),
  priority: z.nativeEnum(FeedbackPriority).default(FeedbackPriority.MEDIUM),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.string().url()).default([]),
});

export const updateFeedbackSchema = createFeedbackSchema.partial().extend({
  status: z.nativeEnum(FeedbackStatus).optional(),
});

export const voteFeedbackSchema = z.object({
  value: z.number().int().min(-1).max(1), // -1 (downvote), 0 (remove), 1 (upvote)
});

export const commentFeedbackSchema = z.object({
  content: z.string().min(1).max(2000),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;
export type VoteFeedbackInput = z.infer<typeof voteFeedbackSchema>;
export type CommentFeedbackInput = z.infer<typeof commentFeedbackSchema>;
