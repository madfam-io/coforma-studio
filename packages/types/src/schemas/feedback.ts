import { z } from 'zod';

export const createFeedbackSchema = z.object({
  cabId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  type: z.enum(['IDEA', 'BUG', 'REQUEST', 'RESEARCH_INSIGHT']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.string().url()).optional(),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;

export const updateFeedbackSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'SHIPPED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  tags: z.array(z.string()).optional(),
  externalId: z.string().optional(),
  externalProvider: z.enum(['JIRA', 'ASANA', 'CLICKUP']).optional(),
  externalUrl: z.string().url().optional(),
});

export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;

export const createCommentSchema = z.object({
  feedbackItemId: z.string().uuid(),
  content: z.string().min(1),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const voteSchema = z.object({
  feedbackItemId: z.string().uuid(),
  value: z.number().int().min(-1).max(1), // -1 = downvote, 1 = upvote
});

export type VoteInput = z.infer<typeof voteSchema>;
