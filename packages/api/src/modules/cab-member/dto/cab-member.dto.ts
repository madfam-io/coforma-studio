import { z } from 'zod';

/**
 * DTO schemas for CAB member operations
 * Using Zod for runtime validation
 */

// Base CAB member response schema
export const cabMemberResponseSchema = z.object({
  id: z.string().uuid(),
  cabId: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tags: z.array(z.string()),
  company: z.string().nullable(),
  title: z.string().nullable(),
  ndaSigned: z.boolean(),
  ndaSignedAt: z.date().nullable(),
  discountPlanId: z.string().uuid().nullable(),
  // Include user data
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().nullable(),
    avatar: z.string().nullable(),
  }),
});

export type CABMemberResponse = z.infer<typeof cabMemberResponseSchema>;

// Add member input schema
export const addMemberSchema = z.object({
  cabId: z.string().uuid(),
  userId: z.string().uuid(),
  company: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(10).default([]),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;

// Update member input schema
export const updateMemberSchema = z.object({
  id: z.string().uuid(),
  company: z.string().max(100).nullable().optional(),
  title: z.string().max(100).nullable().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  ndaSigned: z.boolean().optional(),
  discountPlanId: z.string().uuid().nullable().optional(),
});

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

// List members query schema
export const listMembersSchema = z.object({
  cabId: z.string().uuid(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  ndaSigned: z.boolean().optional(),
});

export type ListMembersInput = z.infer<typeof listMembersSchema>;

// List members response schema
export const listMembersResponseSchema = z.object({
  members: z.array(cabMemberResponseSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});

export type ListMembersResponse = z.infer<typeof listMembersResponseSchema>;

// Get member by ID input schema
export const getMemberByIdSchema = z.object({
  id: z.string().uuid(),
});

export type GetMemberByIdInput = z.infer<typeof getMemberByIdSchema>;

// Remove member input schema
export const removeMemberSchema = z.object({
  id: z.string().uuid(),
});

export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;

// Invite member input schema (for creating user if doesn't exist)
export const inviteMemberSchema = z.object({
  cabId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  company: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(10).default([]),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
