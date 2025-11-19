import { Injectable } from '@nestjs/common';
import { Prisma, SessionStatus } from '@prisma/client';

import { PrismaService } from '../../lib/prisma/prisma.service';
import { LoggerService } from '../../lib/logger/logger.service';
import {
  TenantContextMissingException,
  RecordNotFoundException,
  DatabaseException,
  ValidationException,
} from '../../lib/errors';
import {
  CreateSessionInput,
  UpdateSessionInput,
  ListSessionsInput,
  SessionResponse,
  ListSessionsResponse,
} from './dto/session.dto';

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Create a new session
   * @param tenantId - Tenant ID from authenticated session
   * @param data - Session creation data
   */
  async create(tenantId: string, data: CreateSessionInput): Promise<SessionResponse> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    this.logger.log(`Creating session for CAB: ${data.cabId}`, 'SessionService');

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      // Verify CAB exists and belongs to tenant
      const cab = await this.prisma.cAB.findUnique({
        where: { id: data.cabId },
      });

      if (!cab) {
        throw new RecordNotFoundException('CAB', data.cabId);
      }

      // Validate scheduledAt is in the future
      if (new Date(data.scheduledAt) < new Date()) {
        throw new ValidationException('Session must be scheduled in the future');
      }

      // Create session
      const session = await this.prisma.session.create({
        data: {
          tenantId,
          cabId: data.cabId,
          title: data.title,
          description: data.description || null,
          scheduledAt: new Date(data.scheduledAt),
          duration: data.duration,
          meetingLink: data.meetingLink || null,
          agendaItems: data.agendaItems || null,
          status: SessionStatus.SCHEDULED,
        },
        include: {
          cab: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              attendees: true,
              feedbackItems: true,
              actionItems: true,
            },
          },
        },
      });

      this.logger.log(`Session created successfully: ${session.id}`, 'SessionService');

      return session;
    } catch (error) {
      if (
        error instanceof RecordNotFoundException ||
        error instanceof ValidationException ||
        error instanceof TenantContextMissingException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to create session for CAB: ${data.cabId}`,
        error instanceof Error ? error.stack : undefined,
        'SessionService'
      );

      throw new DatabaseException('Failed to create session', { cabId: data.cabId });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }

  /**
   * Update a session
   * @param tenantId - Tenant ID from authenticated session
   * @param data - Session update data
   */
  async update(tenantId: string, data: UpdateSessionInput): Promise<SessionResponse> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    this.logger.log(`Updating session: ${data.id}`, 'SessionService');

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      // Check if session exists and CAB belongs to tenant
      const existing = await this.prisma.session.findUnique({
        where: { id: data.id },
        include: {
          cab: true,
        },
      });

      if (!existing) {
        throw new RecordNotFoundException('Session', data.id);
      }

      // Validate scheduledAt is in the future if being updated
      if (data.scheduledAt && new Date(data.scheduledAt) < new Date()) {
        throw new ValidationException('Session must be scheduled in the future');
      }

      // Build update data (only include defined fields)
      const updateData: Prisma.SessionUpdateInput = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) {
        updateData.status = data.status;
        // Auto-set endedAt when status changes to COMPLETED or CANCELLED
        if ((data.status === SessionStatus.COMPLETED || data.status === SessionStatus.CANCELLED) && !existing.endedAt) {
          updateData.endedAt = new Date();
        }
      }
      if (data.scheduledAt !== undefined) updateData.scheduledAt = new Date(data.scheduledAt);
      if (data.duration !== undefined) updateData.duration = data.duration;
      if (data.endedAt !== undefined) updateData.endedAt = data.endedAt ? new Date(data.endedAt) : null;
      if (data.meetingLink !== undefined) updateData.meetingLink = data.meetingLink;
      if (data.recordingUrl !== undefined) updateData.recordingUrl = data.recordingUrl;
      if (data.agendaItems !== undefined) updateData.agendaItems = data.agendaItems;

      // Update session
      const session = await this.prisma.session.update({
        where: { id: data.id },
        data: updateData,
        include: {
          cab: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              attendees: true,
              feedbackItems: true,
              actionItems: true,
            },
          },
        },
      });

      this.logger.log(`Session updated successfully: ${session.id}`, 'SessionService');

      return session;
    } catch (error) {
      if (
        error instanceof RecordNotFoundException ||
        error instanceof ValidationException ||
        error instanceof TenantContextMissingException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to update session: ${data.id}`,
        error instanceof Error ? error.stack : undefined,
        'SessionService'
      );

      throw new DatabaseException('Failed to update session', { id: data.id });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }

  /**
   * Get a single session by ID
   * @param tenantId - Tenant ID from authenticated session
   * @param id - Session ID
   */
  async findById(tenantId: string, id: string): Promise<SessionResponse> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      const session = await this.prisma.session.findUnique({
        where: { id },
        include: {
          cab: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              attendees: true,
              feedbackItems: true,
              actionItems: true,
            },
          },
        },
      });

      if (!session) {
        throw new RecordNotFoundException('Session', id);
      }

      return session;
    } catch (error) {
      if (
        error instanceof RecordNotFoundException ||
        error instanceof TenantContextMissingException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to find session: ${id}`,
        error instanceof Error ? error.stack : undefined,
        'SessionService'
      );

      throw new DatabaseException('Failed to find session', { id });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }

  /**
   * List sessions with filtering
   * @param tenantId - Tenant ID from authenticated session
   * @param query - Query parameters
   */
  async findAll(tenantId: string, query: ListSessionsInput): Promise<ListSessionsResponse> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      // Verify CAB exists and belongs to tenant
      const cab = await this.prisma.cAB.findUnique({
        where: { id: query.cabId },
      });

      if (!cab) {
        throw new RecordNotFoundException('CAB', query.cabId);
      }

      // Build where clause
      const where: Prisma.SessionWhereInput = {
        cabId: query.cabId,
      };

      if (query.status !== undefined) {
        where.status = query.status;
      }

      // Date range filtering
      if (query.startDate || query.endDate) {
        where.scheduledAt = {};
        if (query.startDate) {
          where.scheduledAt.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          where.scheduledAt.lte = new Date(query.endDate);
        }
      }

      // Build orderBy
      const orderBy: Prisma.SessionOrderByWithRelationInput = {
        [query.orderBy]: query.orderDirection,
      };

      // Execute queries in parallel
      const [sessions, total] = await Promise.all([
        this.prisma.session.findMany({
          where,
          take: query.limit,
          skip: query.offset,
          orderBy,
          include: {
            cab: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            _count: {
              select: {
                attendees: true,
                feedbackItems: true,
                actionItems: true,
              },
            },
          },
        }),
        this.prisma.session.count({ where }),
      ]);

      return {
        sessions,
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
        `Failed to list sessions for CAB: ${query.cabId}`,
        error instanceof Error ? error.stack : undefined,
        'SessionService'
      );

      throw new DatabaseException('Failed to list sessions', { cabId: query.cabId });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }

  /**
   * Delete a session
   * @param tenantId - Tenant ID from authenticated session
   * @param id - Session ID
   */
  async delete(tenantId: string, id: string): Promise<void> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    this.logger.log(`Deleting session: ${id}`, 'SessionService');

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      // Check if session exists
      const existing = await this.prisma.session.findUnique({
        where: { id },
        include: {
          cab: true,
        },
      });

      if (!existing) {
        throw new RecordNotFoundException('Session', id);
      }

      // Delete session (cascade will handle attendees, feedback, action items)
      await this.prisma.session.delete({
        where: { id },
      });

      this.logger.log(`Session deleted successfully: ${id}`, 'SessionService');
    } catch (error) {
      if (
        error instanceof RecordNotFoundException ||
        error instanceof TenantContextMissingException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to delete session: ${id}`,
        error instanceof Error ? error.stack : undefined,
        'SessionService'
      );

      throw new DatabaseException('Failed to delete session', { id });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }
}
