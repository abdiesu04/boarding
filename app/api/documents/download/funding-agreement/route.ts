import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get authorization token from cookies or header
    let token: string | undefined;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    
    if (!token) {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/(?:^|;\s*)auth-token=([^;]*)/);
      token = match ? decodeURIComponent(match[1]) : undefined;
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { client: true }
    });
    
    if (!user?.client) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Find the funding agreement document
    const document = await prisma.document.findFirst({
      where: { 
        clientId: user.client.id,
        type: 'FUNDING_AGREEMENT'
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!document) {
      return NextResponse.json({ error: 'Funding agreement not found' }, { status: 404 });
    }
    
    // Make sure cloudinaryUrl is using https and has the correct format
    let cloudinaryUrl = document.cloudinaryUrl;
    
    // Ensure URL uses HTTPS
    if (cloudinaryUrl && cloudinaryUrl.startsWith('http:')) {
      cloudinaryUrl = cloudinaryUrl.replace('http:', 'https:');
    }
    
    // For PDF documents, ensure the URL has the correct format for download
    if (document.mimeType === 'application/pdf' && cloudinaryUrl) {
      // If URL doesn't already have fl_attachment parameter, add it
      if (!cloudinaryUrl.includes('fl_attachment=true')) {
        cloudinaryUrl = cloudinaryUrl + (cloudinaryUrl.includes('?') ? '&' : '?') + 'fl_attachment=true';
      }
    }
    
    // Redirect to the Cloudinary URL for download
    return NextResponse.redirect(cloudinaryUrl);
    
  } catch (error) {
    console.error('Error downloading funding agreement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
