import { NextResponse,NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    let token: string | undefined;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } if(!token) {
      token = request.cookies.get('auth-token')?.value;
    }
    const sessionHeader = request.headers.get('x-session-authenticated');
    if (!token && sessionHeader === 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token ?? '');
    
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    

    const prismaAny = prisma as any;
    
    const user = await prismaAny.user.findUnique({
      where: { id: decoded.id },
      include: { client: true }
    });
    
    if (!user?.client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    // Get client documents
    const documents = await prismaAny.document.findMany({
      where: { clientId: user.client.id },
      orderBy: { createdAt: 'desc' }
    });
    
    
    const enhancedDocuments = documents.map((doc: any) => {
      let cloudinaryUrl = doc.cloudinaryUrl;
      
      // Ensure URL uses HTTPS
      if (cloudinaryUrl && cloudinaryUrl.startsWith('http:')) {
        cloudinaryUrl = cloudinaryUrl.replace('http:', 'https:');
      }
      
      if (doc.mimeType === 'application/pdf' && cloudinaryUrl) {
        // If URL doesn't end with .pdf, add fl_attachment for forced download
        if (!cloudinaryUrl.endsWith('.pdf')) {
          cloudinaryUrl = cloudinaryUrl + (cloudinaryUrl.includes('?') ? '&' : '?') + 'fl_attachment=true';
        }
      }
      
      return {
        ...doc,
        cloudinaryUrl: cloudinaryUrl,
        downloadUrl: `/api/documents/download?id=${doc.id}`
      };
    });
    
    
    return NextResponse.json({ documents: enhancedDocuments }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching client documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}