import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/api-auth';

export const GET = withAuth(async (_req: NextRequest) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        creditReport: true,
      },
    });

    return NextResponse.json({ clients }, { status: 200 });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, ['ADMIN', 'SUPER_ADMIN']);


