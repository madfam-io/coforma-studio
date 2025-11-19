import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../lib/prisma/prisma.service';
import { LoggerService } from '../../lib/logger/logger.service';
import {
  TenantContextMissingException,
  RecordNotFoundException,
  DuplicateRecordException,
  DatabaseException,
  ValidationException,
} from '../../lib/errors';
import {
  AddAttendeeInput,
  BulkAddAttendeesInput,
  UpdateAttendeeInput,
  ListAttendeesInput,
  SessionAttendeeResponse,
  ListAttendeesResponse,
  BulkAddAttendeesResponse,
} from './dto/session-attendee.dto';

@Injectable()
export class SessionAttendeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Add an attendee to a session
   * @param tenantId - Tenant ID from authenticated session
   * @param data - Attendee addition data
   */
  async addAttendee(tenantId: string, data: AddAttendeeInput): Promise<SessionAttendeeResponse> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    this.logger.log(`Adding attendee to session: ${data.sessionId}`, 'SessionAttendeeService');

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      // Verify session exists and belongs to tenant
      const session = await this.prisma.session.findUnique({
        where: { id: data.sessionId },
      });

      if (!session) {
        throw new RecordNotFoundException('Session', data.sessionId);
      }

      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        throw new RecordNotFoundException('User', data.userId);
      }

      // Check if user is already an attendee
      const existingAttendee = await this.prisma.sessionAttendee.findUnique({
        where: {
          sessionId_userId: {
            sessionId: data.sessionId,
            userId: data.userId,
          },
        },
      });

      if (existingAttendee) {
        throw new DuplicateRecordException('SessionAttendee', 'userId', data.userId);
      }

      // Add attendee
      const attendee = await this.prisma.sessionAttendee.create({
        data: {
          sessionId: data.sessionId,
          userId: data.userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      this.logger.log(`Attendee added successfully: ${attendee.id}`, 'SessionAttendeeService');

      return attendee;
    } catch (error) {
      if (
        error instanceof RecordNotFoundException ||
        error instanceof DuplicateRecordException ||
        error instanceof TenantContextMissingException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to add attendee to session: ${data.sessionId}`,
        error instanceof Error ? error.stack : undefined,
        'SessionAttendeeService'
      );

      throw new DatabaseException('Failed to add attendee', {
        sessionId: data.sessionId,
        userId: data.userId,
      });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }

  /**
   * Bulk add attendees to a session
   * @param tenantId - Tenant ID from authenticated session
   * @param data - Bulk attendee addition data
   */
  async bulkAddAttendees(
    tenantId: string,
    data: BulkAddAttendeesInput
  ): Promise<BulkAddAttendeesResponse> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    this.logger.log(
      `Bulk adding ${data.userIds.length} attendees to session: ${data.sessionId}`,
      'SessionAttendeeService'
    );

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      // Verify session exists and belongs to tenant
      const session = await this.prisma.session.findUnique({
        where: { id: data.sessionId },
      });

      if (!session) {
        throw new RecordNotFoundException('Session', data.sessionId);
      }

      // Get existing attendees to avoid duplicates
      const existingAttendees = await this.prisma.sessionAttendee.findMany({
        where: {
          sessionId: data.sessionId,
          userId: { in: data.userIds },
        },
        select: { userId: true },
      });

      const existingUserIds = new Set(existingAttendees.map((a) => a.userId));

      // Filter out users who are already attendees
      const newUserIds = data.userIds.filter((userId) => !existingUserIds.has(userId));

      if (newUserIds.length === 0) {
        throw new ValidationException('All specified users are already attendees');
      }

      // Verify all users exist
      const users = await this.prisma.user.findMany({
        where: { id: { in: newUserIds } },
        select: { id: true },
      });

      if (users.length !== newUserIds.length) {
        const foundUserIds = new Set(users.map((u) => u.id));
        const missingUserIds = newUserIds.filter((id) => !foundUserIds.has(id));
        throw new RecordNotFoundException('User', missingUserIds[0]);
      }

      // Bulk create attendees
      await this.prisma.sessionAttendee.createMany({
        data: newUserIds.map((userId) => ({
          sessionId: data.sessionId,
          userId,
        })),
      });

      // Fetch created attendees with user data
      const attendees = await this.prisma.sessionAttendee.findMany({
        where: {
          sessionId: data.sessionId,
          userId: { in: newUserIds },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      this.logger.log(
        `Bulk added ${attendees.length} attendees successfully`,
        'SessionAttendeeService'
      );

      return {
        added: attendees.length,
        attendees,
      };
    } catch (error) {
      if (
        error instanceof RecordNotFoundException ||
        error instanceof ValidationException ||
        error instanceof TenantContextMissingException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to bulk add attendees to session: ${data.sessionId}`,
        error instanceof Error ? error.stack : undefined,
        'SessionAttendeeService'
      );

      throw new DatabaseException('Failed to bulk add attendees', {
        sessionId: data.sessionId,
      });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }

  /**
   * Update an attendee
   * @param tenantId - Tenant ID from authenticated session
   * @param data - Attendee update data
   */
  async update(tenantId: string, data: UpdateAttendeeInput): Promise<SessionAttendeeResponse> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    this.logger.log(`Updating session attendee: ${data.id}`, 'SessionAttendeeService');

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      // Check if attendee exists and session belongs to tenant
      const existing = await this.prisma.sessionAttendee.findUnique({
        where: { id: data.id },
        include: {
          session: true,
        },
      });

      if (!existing) {
        throw new RecordNotFoundException('SessionAttendee', data.id);
      }

      // Build update data (only include defined fields)
      const updateData: Prisma.SessionAttendeeUpdateInput = {};
      if (data.attended !== undefined) updateData.attended = data.attended;
      if (data.talkTime !== undefined) updateData.talkTime = data.talkTime;
      if (data.joinedAt !== undefined) {
        updateData.joinedAt = data.joinedAt ? new Date(data.joinedAt) : null;
      }
      if (data.leftAt !== undefined) {
        updateData.leftAt = data.leftAt ? new Date(data.leftAt) : null;
      }

      // Update attendee
      const attendee = await this.prisma.sessionAttendee.update({
        where: { id: data.id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      this.logger.log(`Attendee updated successfully: ${attendee.id}`, 'SessionAttendeeService');

      return attendee;
    } catch (error) {
      if (
        error instanceof RecordNotFoundException ||
        error instanceof TenantContextMissingException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to update attendee: ${data.id}`,
        error instanceof Error ? error.stack : undefined,
        'SessionAttendeeService'
      );

      throw new DatabaseException('Failed to update attendee', { id: data.id });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }

  /**
   * Get a single attendee by ID
   * @param tenantId - Tenant ID from authenticated session
   * @param id - Attendee ID
   */
  async findById(tenantId: string, id: string): Promise<SessionAttendeeResponse> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      const attendee = await this.prisma.sessionAttendee.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      if (!attendee) {
        throw new RecordNotFoundException('SessionAttendee', id);
      }

      return attendee;
    } catch (error) {
      if (
        error instanceof RecordNotFoundException ||
        error instanceof TenantContextMissingException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to find attendee: ${id}`,
        error instanceof Error ? error.stack : undefined,
        'SessionAttendeeService'
      );

      throw new DatabaseException('Failed to find attendee', { id });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }

  /**
   * List attendees for a session
   * @param tenantId - Tenant ID from authenticated session
   * @param query - Query parameters
   */
  async findAll(tenantId: string, query: ListAttendeesInput): Promise<ListAttendeesResponse> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      // Verify session exists and belongs to tenant
      const session = await this.prisma.session.findUnique({
        where: { id: query.sessionId },
      });

      if (!session) {
        throw new RecordNotFoundException('Session', query.sessionId);
      }

      // Build where clause
      const where: Prisma.SessionAttendeeWhereInput = {
        sessionId: query.sessionId,
      };

      if (query.attended !== undefined) {
        where.attended = query.attended;
      }

      // Execute queries in parallel
      const [attendees, total] = await Promise.all([
        this.prisma.sessionAttendee.findMany({
          where,
          take: query.limit,
          skip: query.offset,
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
              },
            },
          },
        }),
        this.prisma.sessionAttendee.count({ where }),
      ]);

      return {
        attendees,
        total,
        limit: query.limit,
        offset: query.offset,
      };
    } catch (error) {
      if (
        error instanceof RecordNotFoundException ||
        error instanceof TenantContextMissingException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to list attendees for session: ${query.sessionId}`,
        error instanceof Error ? error.stack : undefined,
        'SessionAttendeeService'
      );

      throw new DatabaseException('Failed to list attendees', { sessionId: query.sessionId });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }

  /**
   * Remove an attendee from a session
   * @param tenantId - Tenant ID from authenticated session
   * @param id - Attendee ID
   */
  async remove(tenantId: string, id: string): Promise<void> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    this.logger.log(`Removing session attendee: ${id}`, 'SessionAttendeeService');

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      // Check if attendee exists
      const existing = await this.prisma.sessionAttendee.findUnique({
        where: { id },
        include: {
          session: true,
        },
      });

      if (!existing) {
        throw new RecordNotFoundException('SessionAttendee', id);
      }

      // Remove attendee
      await this.prisma.sessionAttendee.delete({
        where: { id },
      });

      this.logger.log(`Attendee removed successfully: ${id}`, 'SessionAttendeeService');
    } catch (error) {
      if (
        error instanceof RecordNotFoundException ||
        error instanceof TenantContextMissingException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to remove attendee: ${id}`,
        error instanceof Error ? error.stack : undefined,
        'SessionAttendeeService'
      );

      throw new DatabaseException('Failed to remove attendee', { id });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }
}
