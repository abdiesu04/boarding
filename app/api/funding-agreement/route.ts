import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { generateFundingAgreementPDF } from '@/lib/pdf-generator';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { z } from 'zod';

// Schema for funding agreement submission
const fundingAgreementSchema = z.object({
  signature: z.string().min(1),
  phone: z.string().optional(),
});
function getCookie(name: string) {
     const value = `; ${document.cookie}`;
     const parts = value.split(`; ${name}=`);
     if (parts.length === 2) {
       const part = parts.pop();
       if (part !== undefined) {
         return part.split(';').shift();
       }
     }
     return null;
   }

export async function POST(request: Request) {
  try {
    // Extract 'auth-token' from cookies header
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:^|;\s*)auth-token=([^;]*)/);
    const cookieToken = match ? decodeURIComponent(match[1]) : null;
    if (!cookieToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(cookieToken);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        client: true,
      },
    });
    
    if (!user || !user.client) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    
    const body = await request.json();
    try {
      fundingAgreementSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.format() }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    
    // Generate PDF with client information and signature
    // Combine user and client data for complete information
    const clientData = {
      ...user.client,
      // Update phone from request if provided
      phone: body.phone || user.client?.phone || '',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    };
    
    const pdfBytes = await generateFundingAgreementPDF(
      clientData,
      body.signature
    );
    
    // Convert PDF bytes to base64 for direct download
    const pdfBase64 = `data:application/pdf;base64,${Buffer.from(pdfBytes).toString('base64')}`;
    
    // Also upload to Cloudinary for storage
    const fileName = `funding_agreement_${user.id}_${Date.now()}`;
    const cloudinaryResult = await uploadToCloudinary(
      pdfBase64,
      'funding_agreements',
      fileName
    );
    
    // Save document reference in database
    const document = await prisma.document.create({
      data: {
        clientId: user.client.id,
        type: 'FUNDING_AGREEMENT',
        cloudinaryUrl: cloudinaryResult.url,
        cloudinaryId: cloudinaryResult.publicId,
        fileName: `${user.firstName}_${user.lastName}_Funding_Agreement.pdf`,
        fileSize: pdfBytes.length,
        mimeType: 'application/pdf',
      },
    });

    // Mark documentsSigned as true for the client
    await prisma.client.update({
      where: { id: user.client.id },
      data: { documentsSigned: true },
    });

    // Return success response with both PDF base64 data and Cloudinary URL
    return NextResponse.json({
      message: 'Funding agreement submitted successfully',
      pdfUrl: cloudinaryResult.url, // Keep this for backward compatibility
      pdfBase64: pdfBase64, // Add this for direct download
      documentId: document.id,
      fileName: `${user.firstName}_${user.lastName}_Funding_Agreement.pdf`,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Funding agreement submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
