import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { z } from 'zod';

@Injectable()
export class TrpcRouter {
  constructor(private readonly trpc: TrpcService) {}

  appRouter = this.trpc.router({
    // Health check
    health: this.trpc.procedure.query(() => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    }),

    // Auth routes
    auth: this.trpc.router({
      me: this.trpc.protectedProcedure.query(({ ctx }) => {
        return ctx.session.user;
      }),

      myTenants: this.trpc.protectedProcedure.query(async ({ ctx }) => {
        const memberships = await ctx.prisma.tenantMembership.findMany({
          where: { userId: ctx.session.user.id },
          include: {
            tenant: {
              select: {
                id: true,
                slug: true,
                name: true,
                logo: true,
                brandColor: true,
              },
            },
          },
        });

        return memberships.map(m => ({
          ...m.tenant,
          role: m.role,
        }));
      }),
    }),

    // Tenant routes (example)
    tenants: this.trpc.router({
      current: this.trpc.tenantProcedure.query(({ ctx }) => {
        return ctx.tenant;
      }),

      create: this.trpc.protectedProcedure
        .input(
          z.object({
            name: z.string().min(1).max(100),
            slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          // Check if slug is available
          const existing = await ctx.prisma.tenant.findUnique({
            where: { slug: input.slug },
          });

          if (existing) {
            throw new Error('Slug already taken');
          }

          // Create tenant
          const tenant = await ctx.prisma.tenant.create({
            data: {
              name: input.name,
              slug: input.slug,
            },
          });

          // Add creator as admin
          await ctx.prisma.tenantMembership.create({
            data: {
              tenantId: tenant.id,
              userId: ctx.session.user.id,
              role: 'ADMIN',
            },
          });

          return tenant;
        }),
    }),

    // CAB routes (placeholder - will expand)
    cabs: this.trpc.router({
      list: this.trpc.tenantProcedure.query(async ({ ctx }) => {
        return ctx.prisma.cAB.findMany({
          where: { tenantId: ctx.tenant.id },
          orderBy: { createdAt: 'desc' },
        });
      }),

      create: this.trpc.tenantProcedure
        .input(
          z.object({
            name: z.string().min(1).max(100),
            description: z.string().optional(),
            slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
            maxMembers: z.number().int().positive().optional(),
            requiresNDA: z.boolean().default(false),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          return ctx.prisma.cAB.create({
            data: {
              ...input,
              tenantId: ctx.tenant.id,
            },
          });
        }),
    }),
  });

  get type() {
    return this.appRouter;
  }
}

export type AppRouter = TrpcRouter['appRouter'];
