import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../lib/prisma/prisma.service';
import { LoggerService } from '../../lib/logger/logger.service';
import {
  TenantContextMissingException,
  RecordNotFoundException,
  DuplicateRecordException,
  DatabaseException,
} from '../../lib/errors';
import {
  CreateCABInput,
  UpdateCABInput,
  ListCABsInput,
  CABResponse,
  ListCABsResponse,
} from './dto/cab.dto';

@Injectable()
export class CABService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Create a new CAB
   * @param tenantId - Tenant ID from authenticated session
   * @param data - CAB creation data
   */
  async create(tenantId: string, data: CreateCABInput): Promise<CABResponse> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    this.logger.log(`Creating CAB: ${data.name} for tenant: ${tenantId}`, 'CABService');

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      // Check if slug is already taken within this tenant
      const existing = await this.prisma.cAB.findUnique({
        where: {
          tenantId_slug: {
            tenantId,
            slug: data.slug,
          },
        },
      });

      if (existing) {
        throw new DuplicateRecordException('CAB', 'slug', data.slug);
      }

      // Create CAB
      const cab = await this.prisma.cAB.create({
        data: {
          tenantId,
          name: data.name,
          description: data.description || null,
          slug: data.slug,
          maxMembers: data.maxMembers || null,
          requiresNDA: data.requiresNDA,
        },
        include: {
          _count: {
            select: {
              members: true,
              sessions: true,
              feedbackItems: true,
            },
          },
        },
      });

      this.logger.log(`CAB created successfully: ${cab.id}`, 'CABService');

      return cab;
    } catch (error) {
      if (
        error instanceof DuplicateRecordException ||
        error instanceof TenantContextMissingException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to create CAB: ${data.name}`,
        error instanceof Error ? error.stack : undefined,
        'CABService'
      );

      throw new DatabaseException('Failed to create CAB', {
        name: data.name,
        slug: data.slug,
      });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }

  /**
   * Update an existing CAB
   * @param tenantId - Tenant ID from authenticated session
   * @param data - CAB update data
   */
  async update(tenantId: string, data: UpdateCABInput): Promise<CABResponse> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    this.logger.log(`Updating CAB: ${data.id} for tenant: ${tenantId}`, 'CABService');

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      // Check if CAB exists
      const existing = await this.prisma.cAB.findUnique({
        where: { id: data.id },
      });

      if (!existing) {
        throw new RecordNotFoundException('CAB', data.id);
      }

      // If slug is being changed, check if new slug is available
      if (data.slug && data.slug !== existing.slug) {
        const slugTaken = await this.prisma.cAB.findUnique({
          where: {
            tenantId_slug: {
              tenantId,
              slug: data.slug,
            },
          },
        });

        if (slugTaken) {
          throw new DuplicateRecordException('CAB', 'slug', data.slug);
        }
      }

      // Build update data (only include defined fields)
      const updateData: Prisma.CABUpdateInput = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.maxMembers !== undefined) updateData.maxMembers = data.maxMembers;
      if (data.requiresNDA !== undefined) updateData.requiresNDA = data.requiresNDA;

      // Update CAB
      const cab = await this.prisma.cAB.update({
        where: { id: data.id },
        data: updateData,
        include: {
          _count: {
            select: {
              members: true,
              sessions: true,
              feedbackItems: true,
            },
          },
        },
      });

      this.logger.log(`CAB updated successfully: ${cab.id}`, 'CABService');

      return cab;
    } catch (error) {
      if (
        error instanceof RecordNotFoundException ||
        error instanceof DuplicateRecordException ||
        error instanceof TenantContextMissingException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to update CAB: ${data.id}`,
        error instanceof Error ? error.stack : undefined,
        'CABService'
      );

      throw new DatabaseException('Failed to update CAB', { id: data.id });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }

  /**
   * Get a single CAB by ID
   * @param tenantId - Tenant ID from authenticated session
   * @param id - CAB ID
   */
  async findById(tenantId: string, id: string): Promise<CABResponse> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      const cab = await this.prisma.cAB.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              members: true,
              sessions: true,
              feedbackItems: true,
            },
          },
        },
      });

      if (!cab) {
        throw new RecordNotFoundException('CAB', id);
      }

      return cab;
    } catch (error) {
      if (
        error instanceof RecordNotFoundException ||
        error instanceof TenantContextMissingException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to find CAB: ${id}`,
        error instanceof Error ? error.stack : undefined,
        'CABService'
      );

      throw new DatabaseException('Failed to find CAB', { id });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }

  /**
   * Get a single CAB by slug
   * @param tenantId - Tenant ID from authenticated session
   * @param slug - CAB slug
   */
  async findBySlug(tenantId: string, slug: string): Promise<CABResponse> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      const cab = await this.prisma.cAB.findUnique({
        where: {
          tenantId_slug: {
            tenantId,
            slug,
          },
        },
        include: {
          _count: {
            select: {
              members: true,
              sessions: true,
              feedbackItems: true,
            },
          },
        },
      });

      if (!cab) {
        throw new RecordNotFoundException('CAB', slug);
      }

      return cab;
    } catch (error) {
      if (
        error instanceof RecordNotFoundException ||
        error instanceof TenantContextMissingException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to find CAB by slug: ${slug}`,
        error instanceof Error ? error.stack : undefined,
        'CABService'
      );

      throw new DatabaseException('Failed to find CAB', { slug });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }

  /**
   * List CABs with pagination and filtering
   * @param tenantId - Tenant ID from authenticated session
   * @param query - Query parameters
   */
  async findAll(tenantId: string, query: ListCABsInput): Promise<ListCABsResponse> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      // Build where clause
      const where: Prisma.CABWhereInput = {
        tenantId,
      };

      if (query.isActive !== undefined) {
        where.isActive = query.isActive;
      }

      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { slug: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      // Build orderBy clause
      const orderBy: Prisma.CABOrderByWithRelationInput = {
        [query.orderBy]: query.orderDirection,
      };

      // Execute queries in parallel
      const [cabs, total] = await Promise.all([
        this.prisma.cAB.findMany({
          where,
          orderBy,
          take: query.limit,
          skip: query.offset,
          include: {
            _count: {
              select: {
                members: true,
                sessions: true,
                feedbackItems: true,
              },
            },
          },
        }),
        this.prisma.cAB.count({ where }),
      ]);

      return {
        cabs,
        total,
        limit: query.limit,
        offset: query.offset,
      };
    } catch (error) {
      if (error instanceof TenantContextMissingException) {
        throw error;
      }

      this.logger.error(
        'Failed to list CABs',
        error instanceof Error ? error.stack : undefined,
        'CABService'
      );

      throw new DatabaseException('Failed to list CABs');
    } finally {
      await this.prisma.clearTenantContext();
    }
  }

  /**
   * Delete a CAB
   * @param tenantId - Tenant ID from authenticated session
   * @param id - CAB ID
   */
  async delete(tenantId: string, id: string): Promise<void> {
    if (!tenantId) {
      throw new TenantContextMissingException();
    }

    this.logger.log(`Deleting CAB: ${id} for tenant: ${tenantId}`, 'CABService');

    try {
      // Set tenant context for RLS
      await this.prisma.setTenantContext(tenantId);

      // Check if CAB exists
      const existing = await this.prisma.cAB.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new RecordNotFoundException('CAB', id);
      }

      // Delete CAB (cascades to members, sessions, etc.)
      await this.prisma.cAB.delete({
        where: { id },
      });

      this.logger.log(`CAB deleted successfully: ${id}`, 'CABService');
    } catch (error) {
      if (
        error instanceof RecordNotFoundException ||
        error instanceof TenantContextMissingException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to delete CAB: ${id}`,
        error instanceof Error ? error.stack : undefined,
        'CABService'
      );

      throw new DatabaseException('Failed to delete CAB', { id });
    } finally {
      await this.prisma.clearTenantContext();
    }
  }
}
