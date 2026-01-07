import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/register',
  '/privacy',
  '/terms',
  '/about',
  '/contact',
  '/why-movesbook',
  '/dealers',
  '/subscribe-newsletter',
  '/references',
  '/support',
  '/forum',
  '/blog',
  '/testimonials',
  '/news',
  '/sell-buy',
  '/job-offers',
  '/promote-yourself',
  '/our-shop'
];

// API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/reset-password',
  '/api/auth/reset-username'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // For API routes, check authentication via token in header
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('token') || request.headers.get('authorization');
    if (!token && !publicApiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // For page routes, we'll handle authentication client-side
  // The middleware just allows the request to pass through
  // Client-side components will check auth and redirect if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

