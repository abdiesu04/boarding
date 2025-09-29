import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/api-auth';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { pathname } = new URL(req.url);
    const parts = pathname.split('/');
    const clientId = parts[parts.indexOf('clients') + 1];

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        documents: true,
        creditReport: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ client }, { status: 200 });
  } catch (e) {
    console.error('Error fetching client by id:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, ['ADMIN', 'SUPER_ADMIN']);

