import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract and verify token
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Get document ID from query parameter
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }
    
    // Use any type to bypass TypeScript errors due to Prisma client generation issues
    const prismaAny = prisma as any;
    
    // Get user from database
    const user = await prismaAny.user.findUnique({
      where: { id: decoded.id },
      include: { client: true }
    });
    
    if (!user?.client) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get document
    const document = await prismaAny.document.findUnique({
      where: { id }
    });
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Verify the document belongs to the client
    if (document.clientId !== user.client.id) {
      return NextResponse.json({ error: 'Unauthorized access to document' }, { status: 403 });
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
    console.error('Error downloading document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
