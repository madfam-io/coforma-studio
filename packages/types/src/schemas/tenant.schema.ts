import { z } from 'zod';

import { slugSchema, hexColorSchema, emailSchema } from './common.schema';

/**
 * Tenant validation schemas
 */

export const createTenantSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(100),
  domain: z.string().optional(),
  logo: z.string().url().optional(),
  brandColor: hexColorSchema.optional(),
  locale: z.enum(['en', 'es']).default('en'),
  timezone: z.string().default('America/Mexico_City'),
  billingEmail: emailSchema.optional(),
});

export const updateTenantSchema = createTenantSchema.partial();

export const tenantSettingsSchema = z.object({
  whitelabelEnabled: z.boolean().default(false),
  brandColor: hexColorSchema.optional(),
  logo: z.string().url().optional(),
  locale: z.enum(['en', 'es']),
  timezone: z.string(),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type TenantSettings = z.infer<typeof tenantSettingsSchema>;
