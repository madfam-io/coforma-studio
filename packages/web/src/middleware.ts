import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Extract tenant slug from URL
    const tenantMatch = pathname.match(/^\/([^\/]+)/);
    const tenantSlug = tenantMatch?.[1];

    // Skip for auth routes and public pages
    if (
      pathname.startsWith('/auth') ||
      pathname.startsWith('/api') ||
      pathname === '/' ||
      !tenantSlug
    ) {
      return NextResponse.next();
    }

    // Check if user has access to this tenant
    const userTenants = token?.user?.tenants || [];
    const hasTenantAccess = userTenants.some(
      (t: any) => t.slug === tenantSlug
    );

    if (!hasTenantAccess) {
      // Redirect to first tenant or auth
      if (userTenants.length > 0) {
        return NextResponse.redirect(
          new URL(`/${userTenants[0].slug}`, req.url)
        );
      }
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes
        if (
          pathname === '/' ||
          pathname.startsWith('/auth') ||
          pathname.startsWith('/api/auth')
        ) {
          return true;
        }

        // Protected routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
