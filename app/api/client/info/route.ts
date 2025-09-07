import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:^|;\s*)auth-token=([^;]*)/);
    const token = match ? decodeURIComponent(match[1]) : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Extract and verify token
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Get user from database with client information
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        client: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Remove sensitive information
    const { password, ...userWithoutPassword } = user;
    
    // Return client information
    return NextResponse.json({
      client: {
        ...user.client,
        user: userWithoutPassword,
      },
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching client info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
