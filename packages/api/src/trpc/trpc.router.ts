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
import { CABMemberService } from '../modules/cab-member/cab-member.service';
import {
  addMemberSchema,
  updateMemberSchema,
  listMembersSchema,
  getMemberByIdSchema,
  removeMemberSchema,
  inviteMemberSchema,
} from '../modules/cab-member/dto/cab-member.dto';
import { SessionService } from '../modules/session/session.service';
import {
  createSessionSchema,
  updateSessionSchema,
  listSessionsSchema,
  getSessionByIdSchema,
  deleteSessionSchema,
} from '../modules/session/dto/session.dto';
import { SessionAttendeeService } from '../modules/session-attendee/session-attendee.service';
import {
  addAttendeeSchema,
  bulkAddAttendeesSchema,
  updateAttendeeSchema,
  listAttendeesSchema,
  getAttendeeByIdSchema,
  removeAttendeeSchema,
} from '../modules/session-attendee/dto/session-attendee.dto';

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly cabService: CABService,
    private readonly cabMemberService: CABMemberService,
    private readonly sessionService: SessionService,
    private readonly sessionAttendeeService: SessionAttendeeService,
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

    // CAB Member routes - Full CRUD operations with tenant isolation
    cabMembers: this.trpc.router({
      // List members for a CAB
      list: this.trpc.tenantProcedure
        .input(listMembersSchema)
        .query(async ({ input, ctx }) => {
          return this.cabMemberService.findAll(ctx.tenant.id, input);
        }),

      // Get member by ID
      getById: this.trpc.tenantProcedure
        .input(getMemberByIdSchema)
        .query(async ({ input, ctx }) => {
          return this.cabMemberService.findById(ctx.tenant.id, input.id);
        }),

      // Add existing user to CAB
      add: this.trpc.tenantProcedure
        .input(addMemberSchema)
        .mutation(async ({ input, ctx }) => {
          return this.cabMemberService.addMember(ctx.tenant.id, input);
        }),

      // Invite member to CAB (creates user if doesn't exist)
      invite: this.trpc.tenantProcedure
        .input(inviteMemberSchema)
        .mutation(async ({ input, ctx }) => {
          return this.cabMemberService.inviteMember(ctx.tenant.id, input);
        }),

      // Update member
      update: this.trpc.tenantProcedure
        .input(updateMemberSchema)
        .mutation(async ({ input, ctx }) => {
          return this.cabMemberService.update(ctx.tenant.id, input);
        }),

      // Remove member from CAB
      remove: this.trpc.tenantProcedure
        .input(removeMemberSchema)
        .mutation(async ({ input, ctx }) => {
          await this.cabMemberService.remove(ctx.tenant.id, input.id);
          return { success: true };
        }),
    }),

    // Session routes - Full CRUD operations with tenant isolation
    sessions: this.trpc.router({
      // List sessions for a CAB
      list: this.trpc.tenantProcedure
        .input(listSessionsSchema)
        .query(async ({ input, ctx }) => {
          return this.sessionService.findAll(ctx.tenant.id, input);
        }),

      // Get session by ID
      getById: this.trpc.tenantProcedure
        .input(getSessionByIdSchema)
        .query(async ({ input, ctx }) => {
          return this.sessionService.findById(ctx.tenant.id, input.id);
        }),

      // Create session
      create: this.trpc.tenantProcedure
        .input(createSessionSchema)
        .mutation(async ({ input, ctx }) => {
          return this.sessionService.create(ctx.tenant.id, input);
        }),

      // Update session
      update: this.trpc.tenantProcedure
        .input(updateSessionSchema)
        .mutation(async ({ input, ctx }) => {
          return this.sessionService.update(ctx.tenant.id, input);
        }),

      // Delete session
      delete: this.trpc.tenantProcedure
        .input(deleteSessionSchema)
        .mutation(async ({ input, ctx }) => {
          await this.sessionService.delete(ctx.tenant.id, input.id);
          return { success: true };
        }),
    }),

    // Session Attendee routes - Manage session invitations and attendance
    sessionAttendees: this.trpc.router({
      // List attendees for a session
      list: this.trpc.tenantProcedure
        .input(listAttendeesSchema)
        .query(async ({ input, ctx }) => {
          return this.sessionAttendeeService.findAll(ctx.tenant.id, input);
        }),

      // Get attendee by ID
      getById: this.trpc.tenantProcedure
        .input(getAttendeeByIdSchema)
        .query(async ({ input, ctx }) => {
          return this.sessionAttendeeService.findById(ctx.tenant.id, input.id);
        }),

      // Add single attendee to session
      add: this.trpc.tenantProcedure
        .input(addAttendeeSchema)
        .mutation(async ({ input, ctx }) => {
          return this.sessionAttendeeService.addAttendee(ctx.tenant.id, input);
        }),

      // Bulk add attendees to session
      bulkAdd: this.trpc.tenantProcedure
        .input(bulkAddAttendeesSchema)
        .mutation(async ({ input, ctx }) => {
          return this.sessionAttendeeService.bulkAddAttendees(ctx.tenant.id, input);
        }),

      // Update attendee (mark attendance, set join/leave times, talk time)
      update: this.trpc.tenantProcedure
        .input(updateAttendeeSchema)
        .mutation(async ({ input, ctx }) => {
          return this.sessionAttendeeService.update(ctx.tenant.id, input);
        }),

      // Remove attendee from session
      remove: this.trpc.tenantProcedure
        .input(removeAttendeeSchema)
        .mutation(async ({ input, ctx }) => {
          await this.sessionAttendeeService.remove(ctx.tenant.id, input.id);
          return { success: true };
        }),
    }),
  });

  get type() {
    return this.appRouter;
  }
}

export type AppRouter = TrpcRouter['appRouter'];
