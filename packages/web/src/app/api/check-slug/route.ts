import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

const RESERVED_SLUGS = [
  'www',
  'api',
  'admin',
  'app',
  'auth',
  'billing',
  'status',
  'blog',
  'docs',
  'help',
  'support',
  'about',
  'contact',
  'legal',
  'privacy',
  'terms',
  'security',
  'pricing',
  'signup',
  'signin',
  'signout',
  'login',
  'logout',
  'register',
  'dashboard',
  'settings',
  'account',
  'profile',
  'coforma',
  'cdn',
  'static',
  'assets',
  'public',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({
        available: false,
        reason: 'Invalid format (lowercase letters, numbers, hyphens only)',
      });
    }

    // Check if reserved
    if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
      return NextResponse.json({
        available: false,
        reason: 'This URL is reserved',
      });
    }

    // Check if already taken
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      return NextResponse.json({
        available: false,
        reason: 'This URL is already taken',
      });
    }

    return NextResponse.json({
      available: true,
    });
  } catch (error) {
    console.error('Slug check error:', error);
    return NextResponse.json(
      { error: 'Failed to check slug availability' },
      { status: 500 }
    );
  }
}
