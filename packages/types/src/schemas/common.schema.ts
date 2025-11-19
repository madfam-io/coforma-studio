import { z } from 'zod';

/**
 * Common validation schemas used across the application
 */

// UUID validation
export const uuidSchema = z.string().uuid();

// Email validation
export const emailSchema = z.string().email();

// URL validation
export const urlSchema = z.string().url();

// Slug validation (URL-friendly string)
export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be lowercase alphanumeric with hyphens');

// Hex color validation
export const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color');

// Pagination schema
export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
});

// Date range schema
export const dateRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
});

// Sort order schema
export const sortOrderSchema = z.enum(['asc', 'desc']);

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1).max(500),
  filters: z.record(z.unknown()).optional(),
  orderBy: z.record(sortOrderSchema).optional(),
});
