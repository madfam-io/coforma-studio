import { z } from 'zod';

import { TenantRole } from '../enums';

import { emailSchema } from './common.schema';

/**
 * User validation schemas
 */

export const createUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const inviteUserSchema = z.object({
  email: emailSchema,
  role: z.nativeEnum(TenantRole).default(TenantRole.MEMBER),
  cabId: z.string().uuid().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
