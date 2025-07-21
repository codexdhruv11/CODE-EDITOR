import { NextRequest, NextResponse } from 'next/server';
import { STORAGE_KEYS } from './lib/constants';

// Define protected routes that require authentication
const protectedRoutes = [
  '/editor',
  '/profile',
  '/snippets/create',
  '/snippets/edit',
  '/executions',
];

// Define auth routes (login/register)
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get(STORAGE_KEYS.AUTH_TOKEN)?.value;
  
  // Check if the route is protected and user is not authenticated
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  // Check if user is trying to access auth routes while already authenticated
  const isAuthRoute = authRoutes.some(route => pathname === route);
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. robots.txt)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 