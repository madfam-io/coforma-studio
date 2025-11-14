import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for tenant routing and authentication
 * This will be expanded to handle:
 * - Tenant subdomain/domain detection
 * - Session verification
 * - RLS context setting
 */
export function middleware(request: NextRequest) {
  // Placeholder for multi-tenant routing logic
  // TODO: Implement tenant detection from subdomain
  // TODO: Implement session verification
  // TODO: Set tenant context for API calls

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
