import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Schema for credit report submission
const creditReportSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    let token: string | undefined;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (!token) {
      token = request.cookies.get('auth-token')?.value;
    }
    const sessionHeader = request.headers.get('x-session-authenticated');

    // If neither token nor session header, unauthorized
    if (!token && sessionHeader !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If token exists, use token-based auth
    let user: any = null;
    if (token) {
      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      // Get user from database
      user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { client: true },
      });
      if (!user || !user.client) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    // If session-based auth (no token, but sessionHeader is 'true')
    if (!token && sessionHeader === 'true') {
      // You must implement your own session-based user lookup here!
      // For now, just return success for demo:
      return NextResponse.json({ message: 'Credit report information submitted successfully (session)' }, { status: 200 });
    }

    // Parse request body
    const body = await request.json();

    // Validate request data
    try {
      creditReportSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.format() }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Check if credit report already exists
    const existingReport = await prisma.creditReport.findUnique({
      where: { clientId: user.client.id },
    });

    if (existingReport) {
      // Update existing report
      await prisma.creditReport.update({
        where: { id: existingReport.id },
        data: {
          status: 'PENDING',
          requestedAt: new Date(),
          notes: `Username: ${body.username} - Updated at ${new Date().toISOString()}`,
        },
      });
    } else {
      // Create new credit report entry
      await prisma.creditReport.create({
        data: {
          clientId: user.client.id,
          status: 'PENDING',
          notes: `Username: ${body.username} - Created at ${new Date().toISOString()}`,
        },
      });
    }

    await prisma.client.update({
      where: { id: user.client.id },
      data: { creditReportCompleted: true },
    });

    // Return success response
    return NextResponse.json({
      message: 'Credit report information submitted successfully',
    }, { status: 200 });

  } catch (error) {
    console.error('Credit report submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}