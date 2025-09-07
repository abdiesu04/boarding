import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Middleware for authenticating API requests
 * @param handler API route handler
 * @param allowedRoles Array of roles allowed to access the route
 * @returns Next.js API route handler with authentication
 */
export function withAuth(
  handler: (req: NextRequest, user: any, token: string) => Promise<NextResponse>,
  allowedRoles: string[] = ['CLIENT', 'ADMIN', 'SUPER_ADMIN']
) {
  return async (req: NextRequest) => {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract and verify token
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as TokenPayload | null;
    
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Check if user has required role
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        client: decoded.role === 'CLIENT',
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Call the handler with the authenticated user
    return handler(req, user, token);
  };
}


