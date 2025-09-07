
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getTokenFromRequest } from '@/lib/utils';

const infoSchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/),
  dob: z.string().min(1),
  hasMortgage: z.string().min(1),
  fundingAmount: z.string().min(1),
  monthlyIncome: z.string().min(1),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parse = infoSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: parse.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    const { address, city, state, zip, ssn, dob, hasMortgage, fundingAmount, monthlyIncome, phone } = parse.data;

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

    // Find user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for duplicate SSN (not for this user)
    const existing = await prisma.client.findFirst({ where: { ssn } });
    if (existing && existing.userId !== userId) {
      return NextResponse.json({ error: "SSN is already registered" }, { status: 409 });
    }

    // Convert hasMortgage string to boolean
    const hasMortgageBool = hasMortgage === 'yes';
    
    // Upsert all fields for this user
    await prisma.client.upsert({
      where: { userId },
      update: { 
        address, 
        city, 
        state, 
        zip, 
        ssn, 
        dob: new Date(dob),
        hasMortgage: hasMortgageBool,
        loanAmount: fundingAmount,
        monthlyIncome,
        phone: phone || ''
      },
      create: { 
        userId,
        address, 
        city, 
        state, 
        zip, 
        ssn, 
        dob: new Date(dob),
        phone: phone || '', 
        hasMortgage: hasMortgageBool,
        loanAmount: fundingAmount,
        monthlyIncome
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Personal info error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
