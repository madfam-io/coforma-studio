import { Injectable } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';

import { PrismaService } from '../prisma/prisma.service';

export interface Context {
  prisma: PrismaService;
  session: {
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  } | null;
  tenant: {
    id: string;
    slug: string;
    name: string;
  } | null;
}

@Injectable()
export class TrpcService {
  trpc = initTRPC.context<Context>().create();
  procedure = this.trpc.procedure;
  router = this.trpc.router;
  middleware = this.trpc.middleware;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Protected procedure - requires authentication
   */
  protectedProcedure = this.procedure.use(
    this.middleware(async ({ ctx, next }) => {
      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access this resource',
        });
      }
      return next({ ctx: { ...ctx, session: ctx.session } });
    }),
  );

  /**
   * Tenant procedure - requires authentication and tenant context
   */
  tenantProcedure = this.protectedProcedure.use(
    this.middleware(async ({ ctx, next }) => {
      if (!ctx.tenant) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Tenant context required',
        });
      }

      // Verify user belongs to this tenant
      const membership = await ctx.prisma.tenantMembership.findUnique({
        where: {
          tenantId_userId: {
            tenantId: ctx.tenant.id,
            userId: ctx.session.user.id,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this tenant',
        });
      }

      // Set RLS context
      await ctx.prisma.setTenantContext(ctx.tenant.id);

      return next({
        ctx: {
          ...ctx,
          tenant: ctx.tenant,
          membership,
        },
      });
    }),
  );
}
