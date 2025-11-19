import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

export const updateTenantSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  logo: z.string().url().optional(),
  brandColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  locale: z.enum(['en', 'es']).optional(),
  timezone: z.string().optional(),
});

export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
