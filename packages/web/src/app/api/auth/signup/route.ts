import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  companyName: z.string().min(1),
  companySlug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const data = signupSchema.parse(body);

    // Check if slug is already taken
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: data.companySlug },
    });

    if (existingTenant) {
      return NextResponse.json(
        {
          code: 'TENANT_004',
          message: 'Company URL is already taken',
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
        },
      });
    }

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        slug: data.companySlug,
        name: data.companyName,
      },
    });

    // Create tenant membership (make user an admin)
    await prisma.tenantMembership.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        role: 'ADMIN',
      },
    });

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          code: 'VAL_001',
          message: 'Invalid data provided',
          context: { errors: error.errors },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          code: 'SYS_001',
          message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        code: 'SYS_001',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
