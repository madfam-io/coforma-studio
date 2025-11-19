import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { signUpSchema } from '@coforma/types';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = signUpSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if slug is available
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: validatedData.companySlug },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Company URL already taken' },
        { status: 400 }
      );
    }

    // Create user and tenant atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
        },
      });

      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.companyName,
          slug: validatedData.companySlug,
        },
      });

      // Create admin membership
      await tx.tenantMembership.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          role: 'ADMIN',
        },
      });

      return { user, tenant };
    });

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      tenant: {
        id: result.tenant.id,
        slug: result.tenant.slug,
        name: result.tenant.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
