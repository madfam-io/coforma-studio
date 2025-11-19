import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { TrpcService } from './trpc.service';
import { CABService } from '../modules/cab/cab.service';
import {
  createCABSchema,
  updateCABSchema,
  listCABsSchema,
  getCABByIdSchema,
  getCABBySlugSchema,
  deleteCABSchema,
} from '../modules/cab/dto/cab.dto';

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly cabService: CABService,
  ) {}

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

    // CAB routes - Full CRUD operations with tenant isolation
    cabs: this.trpc.router({
      // List CABs with pagination and filtering
      list: this.trpc.tenantProcedure
        .input(listCABsSchema)
        .query(async ({ input, ctx }) => {
          return this.cabService.findAll(ctx.tenant.id, input);
        }),

      // Get CAB by ID
      getById: this.trpc.tenantProcedure
        .input(getCABByIdSchema)
        .query(async ({ input, ctx }) => {
          return this.cabService.findById(ctx.tenant.id, input.id);
        }),

      // Get CAB by slug
      getBySlug: this.trpc.tenantProcedure
        .input(getCABBySlugSchema)
        .query(async ({ input, ctx }) => {
          return this.cabService.findBySlug(ctx.tenant.id, input.slug);
        }),

      // Create CAB
      create: this.trpc.tenantProcedure
        .input(createCABSchema)
        .mutation(async ({ input, ctx }) => {
          return this.cabService.create(ctx.tenant.id, input);
        }),

      // Update CAB
      update: this.trpc.tenantProcedure
        .input(updateCABSchema)
        .mutation(async ({ input, ctx }) => {
          return this.cabService.update(ctx.tenant.id, input);
        }),

      // Delete CAB
      delete: this.trpc.tenantProcedure
        .input(deleteCABSchema)
        .mutation(async ({ input, ctx }) => {
          await this.cabService.delete(ctx.tenant.id, input.id);
          return { success: true };
        }),
    }),
  });

  get type() {
    return this.appRouter;
  }
}

export type AppRouter = TrpcRouter['appRouter'];
