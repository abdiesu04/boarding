import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Import from edge-auth instead of auth for Edge compatibility
import { verifyToken, TokenPayload } from '@/lib/edge-auth';

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard': ['CLIENT', 'ADMIN', 'SUPER_ADMIN'],
  '/admin': ['ADMIN', 'SUPER_ADMIN'],
  '/admin/users': ['SUPER_ADMIN'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[Middleware] Request for path: ${pathname}`);
  
  // Check if the route is protected
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  console.log(`[Middleware] Is protected route: ${isProtectedRoute}`);
  
  if (!isProtectedRoute) {
    console.log(`[Middleware] Not a protected route, proceeding normally`);
    return NextResponse.next();
  }
  
  // Log all cookies for debugging
  console.log(`[Middleware] All cookies:`, request.cookies.getAll());
  
  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;
  
  console.log(`[Middleware] Token from cookies: ${token ? 'exists' : 'missing'}`);
  
  if (!token) {
    // Redirect to login if no token
    console.log(`[Middleware] No token found, redirecting to login`);
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    console.log(`[Middleware] Redirect URL: ${url.toString()}`);
    return NextResponse.redirect(url);
  }
  
  // Verify token with detailed debugging
  console.log(`[Middleware] About to verify token with length: ${token.length}`);
  
  // Log token structure (safely)
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      console.log(`[Middleware] Token structure: header.payload.signature (${parts[0].length}.${parts[1].length}.${parts[2].length})`);
      
      // Decode header and payload (these are safe to decode, they're just base64)
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      console.log(`[Middleware] Token header:`, header);
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      // Don't log sensitive parts of the payload
      const safePayload = { ...payload };
      if (safePayload.id) safePayload.id = safePayload.id.substring(0, 5) + '...';
      console.log(`[Middleware] Token payload:`, safePayload);
      
      // Check expiration
      if (payload.exp) {
        const expiryDate = new Date(payload.exp * 1000);
        const now = new Date();
        console.log(`[Middleware] Token expiry: ${expiryDate.toISOString()}, Current time: ${now.toISOString()}, Expired: ${now > expiryDate}`);
      }
    } else {
      console.log(`[Middleware] Unexpected token format: doesn't have 3 parts separated by dots`);
    }
  } catch (e) {
    console.error(`[Middleware] Error parsing token structure:`, e);
  }
  
  // Verify token - now using async Edge-compatible verification
  const decoded = await verifyToken(token);
  
  console.log(`[Middleware] Token verification result:`, decoded ? 'valid' : 'invalid');
  
  if (!decoded) {
    // Redirect to login if token is invalid
    console.log(`[Middleware] Invalid token, redirecting to login`);
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  console.log(`[Middleware] User authenticated with role: ${decoded.role}`);
  
  // Check if user has required role for the route
  const requiredRoles = Object.entries(protectedRoutes).find(([route]) => 
    pathname === route || pathname.startsWith(`${route}/`)
  )?.[1];
  
  console.log(`[Middleware] Required roles for this route:`, requiredRoles);
  
  if (requiredRoles && !requiredRoles.includes(decoded.role)) {
    // Redirect to dashboard if user doesn't have required role
    console.log(`[Middleware] User does not have required role, redirecting to dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  console.log(`[Middleware] Access granted to ${pathname}`);
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};


