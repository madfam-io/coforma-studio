import { z } from 'zod';

export const createCABSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  maxMembers: z.number().int().positive().optional(),
  requiresNDA: z.boolean().default(false),
});

export type CreateCABInput = z.infer<typeof createCABSchema>;

export const updateCABSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  maxMembers: z.number().int().positive().optional(),
  requiresNDA: z.boolean().optional(),
});

export type UpdateCABInput = z.infer<typeof updateCABSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  company: z.string().optional(),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
