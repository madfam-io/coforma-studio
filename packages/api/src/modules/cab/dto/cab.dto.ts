import { z } from 'zod';

/**
 * DTO schemas for CAB operations
 * Using Zod for runtime validation
 */

// Base CAB response schema
export const cabResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  isActive: z.boolean(),
  maxMembers: z.number().int().positive().nullable(),
  requiresNDA: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  _count: z
    .object({
      members: z.number().int(),
      sessions: z.number().int(),
      feedbackItems: z.number().int(),
    })
    .optional(),
});

export type CABResponse = z.infer<typeof cabResponseSchema>;

// Create CAB input schema
export const createCABSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  maxMembers: z.number().int().positive().optional(),
  requiresNDA: z.boolean().default(false),
});

export type CreateCABInput = z.infer<typeof createCABSchema>;

// Update CAB input schema (all fields optional except id)
export const updateCABSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  description: z.string().max(2000, 'Description must be less than 2000 characters').nullable().optional(),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  isActive: z.boolean().optional(),
  maxMembers: z.number().int().positive().nullable().optional(),
  requiresNDA: z.boolean().optional(),
});

export type UpdateCABInput = z.infer<typeof updateCABSchema>;

// List CABs query schema
export const listCABsSchema = z.object({
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  orderBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).default('desc'),
});

export type ListCABsInput = z.infer<typeof listCABsSchema>;

// List CABs response schema
export const listCABsResponseSchema = z.object({
  cabs: z.array(cabResponseSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});

export type ListCABsResponse = z.infer<typeof listCABsResponseSchema>;

// Get CAB by ID input schema
export const getCABByIdSchema = z.object({
  id: z.string().uuid(),
});

export type GetCABByIdInput = z.infer<typeof getCABByIdSchema>;

// Get CAB by slug input schema
export const getCABBySlugSchema = z.object({
  slug: z.string(),
});

export type GetCABBySlugInput = z.infer<typeof getCABBySlugSchema>;

// Delete CAB input schema
export const deleteCABSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteCABInput = z.infer<typeof deleteCABSchema>;
