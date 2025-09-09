import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/registerschema';
import { z } from 'zod';
import {sendOnboardingEmail} from '@/lib/email';
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // console.log('Registration request body:', body);
    
    try {
      registerSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation errors:", JSON.stringify(error.format(), null, 2));
        return NextResponse.json({ error: error.format() }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(body.password);
    
    // Create the user with proper names
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        // Use firstName and lastName from body if available, otherwise fall back to name
        firstName: body.firstName || body.name,
        lastName: body.lastName || "",
        role: 'CLIENT',
      },
    });

    // Create a basic client record with phone number if provided
    if (body.phone) {
      try {
        await prisma.client.create({
          data: {
            userId: user.id,
            phone: body.phone,
            ssn: '', // Will be filled later in personal-info
            dob: new Date(), // Will be filled later in personal-info
            address: '', // Will be filled later in personal-info
            city: '', // Will be filled later in personal-info
            state: '', // Will be filled later in personal-info
            zip: '', // Will be filled later in personal-info
            loanAmount: '', // Will be filled later in personal-info
            monthlyIncome: '', // Will be filled later in personal-info
          },
        });
      } catch (clientError) {
        console.error('Failed to create client record:', clientError);
        // Continue even if client creation fails - it will be created later in personal-info
      }
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Optionally send onboarding email (can use name as firstName)
    try {
      const { sendOnboardingEmail } = await import('@/lib/email');
      const nextStepUrl = `/personal-info?token=${encodeURIComponent(token)}`;
      await sendOnboardingEmail(user.email, {
        name: user.firstName,
        nextStepUrl
      });
    } catch (emailError) {
      console.error('Failed to send onboarding email:', emailError);
    }

    const { password, ...userData } = user;

    // Set token as HTTP-only cookie
    const response = NextResponse.json({
      message: 'Registration successful',
      user: userData,
      token,
    }, { status: 201 });
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    return response;
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


