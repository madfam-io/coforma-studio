import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  companyName: z.string().min(1, 'Company name is required').max(100),
  companySlug: z
    .string()
    .min(1, 'Company slug is required')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type SignInInput = z.infer<typeof signInSchema>;
