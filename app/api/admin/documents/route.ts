import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/api-auth';

export const GET = withAuth(async (_req: NextRequest) => {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true }
            }
          }
        }
      }
    });

    const enhancedDocuments = documents.map((doc) => {
      let cloudinaryUrl = doc.cloudinaryUrl;
      if (cloudinaryUrl && cloudinaryUrl.startsWith('http:')) {
        cloudinaryUrl = cloudinaryUrl.replace('http:', 'https:');
      }
      if (doc.mimeType === 'application/pdf' && cloudinaryUrl && !cloudinaryUrl.endsWith('.pdf')) {
        cloudinaryUrl = cloudinaryUrl + (cloudinaryUrl.includes('?') ? '&' : '?') + 'fl_attachment=true';
      }
      return { ...doc, cloudinaryUrl };
    });

    return NextResponse.json({ documents: enhancedDocuments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, ['ADMIN', 'SUPER_ADMIN']);


