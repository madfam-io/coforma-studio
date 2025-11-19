import { z } from 'zod';
import { slugSchema } from './common.schema';

/**
 * CAB (Customer Advisory Board) validation schemas
 */

export const createCABSchema = z.object({
  name: z.string().min(1).max(200),
  slug: slugSchema,
  description: z.string().max(2000).optional(),
  isActive: z.boolean().default(true),
  maxMembers: z.number().int().positive().optional(),
  requiresNDA: z.boolean().default(false),
});

export const updateCABSchema = createCABSchema.partial();

export const addCABMemberSchema = z.object({
  userId: z.string().uuid(),
  tags: z.array(z.string()).default([]),
  company: z.string().max(200).optional(),
  title: z.string().max(200).optional(),
  ndaSigned: z.boolean().default(false),
});

export type CreateCABInput = z.infer<typeof createCABSchema>;
export type UpdateCABInput = z.infer<typeof updateCABSchema>;
export type AddCABMemberInput = z.infer<typeof addCABMemberSchema>;
