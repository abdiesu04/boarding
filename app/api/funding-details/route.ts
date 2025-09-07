import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getTokenFromRequest } from '@/lib/utils';

const fundingDetailsSchema = z.object({
  hasMortgage: z.boolean().default(false),
  loanAmount: z.string()
    .min(1, { message: "Loan amount is required" })
    .refine((val) => !isNaN(Number(val.replace(/[^0-9.-]+/g, ""))), {
      message: "Please enter a valid amount"
    })
    .refine((val) => Number(val.replace(/[^0-9.-]+/g, "")) > 0, {
      message: "Loan amount must be greater than $0"
    }),
  monthlyIncome: z.string()
    .min(1, { message: "Monthly income is required" })
    .refine((val) => !isNaN(Number(val.replace(/[^0-9.-]+/g, ""))), {
      message: "Please enter a valid amount"
    })
    .refine((val) => Number(val.replace(/[^0-9.-]+/g, "")) > 0, {
      message: "Monthly income must be greater than $0"
    }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    try {
      fundingDetailsSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.format() }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Get user from token (assume JWT in cookie or header)
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Decode token to get user id
    let userId = null;
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      userId = payload.id;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Find client by userId
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update or create client record
    let client = await prisma.client.findUnique({ where: { userId: userId } });
    if (!client) {
      client = await prisma.client.create({
        data: {
          userId: userId,
          phone: '',
          ssn: '',
          dob: new Date(),
          address: '',
          city: '',
          state: '',
          zip: '',
          hasMortgage: body.hasMortgage,
          loanAmount: body.loanAmount,
          monthlyIncome: body.monthlyIncome,
        },
      });
    } else {
      client = await prisma.client.update({
        where: { userId: userId },
        data: {
          hasMortgage: body.hasMortgage,
          loanAmount: body.loanAmount,
          monthlyIncome: body.monthlyIncome,
        },
      });
    }

    return NextResponse.json({ message: 'Funding details saved', client }, { status: 200 });
  } catch (error) {
    console.error('Funding details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
