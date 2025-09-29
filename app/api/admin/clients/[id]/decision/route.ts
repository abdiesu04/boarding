// app/api/admin/clients/[id]/decision/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/api-auth';
import { sendDecisionEmail } from '@/lib/sendDecisionEmail';
export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { decision } = body;
    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision value' }, { status: 400 });
    }

    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const clientId = parts[parts.indexOf('clients') + 1];

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { user: { select: { firstName: true, email: true } } },
    });

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    // Update status
    await prisma.client.update({
      where: { id: clientId },
      data: { fundingStatus: decision },
    });

    // Send email (errors logged but do not block)
    try {
      await sendDecisionEmail(client.user.email, { name: client.user.firstName, decision });
      console.log("email sent")
    } catch (emailErr) {
      console.error('Failed to send decision email:', emailErr);
    }

    return NextResponse.json({ message: `Client ${decision.toLowerCase()} and notified.` });
  } catch (error) {
    console.error('Error updating client decision:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, ['ADMIN', 'SUPER_ADMIN']);
// app/api/admin/clients/[id]/decision/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/db';
// import { withAuth } from '@/lib/api-auth';
// // No longer importing sendDecisionEmail directly from lib
// import { getBaseUrl } from '@/lib/getBaseUrl'; // Need this for email content

// export const POST = withAuth(async (req: NextRequest) => {
//   try {
//     const body = await req.json();
//     const { decision } = body;
//     if (!['APPROVED', 'REJECTED'].includes(decision)) {
//       return NextResponse.json({ error: 'Invalid decision value' }, { status: 400 });
//     }

//     const url = new URL(req.url);
//     const parts = url.pathname.split('/');
//     const clientId = parts[parts.indexOf('clients') + 1];

//     const client = await prisma.client.findUnique({
//       where: { id: clientId },
//       include: { user: { select: { firstName: true, email: true } } },
//     });

//     if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

//     // Update status
//     await prisma.client.update({
//       where: { id: clientId },
//       data: { fundingStatus: decision },
//     });

//     // Send email via internal API route
//     try {
//       const emailSubject = `Your funding request has been ${decision.toLowerCase()}`;
//       const emailHtml = `
//             <!DOCTYPE html>
//             <html>
//             <body style="font-family: Arial, sans-serif; background: #f6faff; margin: 0; padding: 0;">
//                 <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
//                 <h2 style="color: #2563eb;">Hello ${client.user.firstName},</h2>
//                 <p>Your funding request has been <strong>${decision}</strong>.</p>
//                 ${
//                     decision === 'APPROVED'
//                     ? `<p>You can now access your funding agreement and next steps <a href="${getBaseUrl()}/admin/clients">here</a>.</p>`
//                     : `<p>Unfortunately, your request was not approved. Please contact support for more details.</p>`
//                 }
//                 <p style="color: #64748b;">Thank you for using our services.</p>
//                 </div>
//             </body>
//             </html>
//         `;

//       await fetch(`${getBaseUrl()}/api/send-email`, { // Assuming getBaseUrl returns your app's base URL
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           // You might want to add an internal API key here for security
//         },
//         body: JSON.stringify({
//           to: client.user.email,
//           subject: emailSubject,
//           htmlContent: emailHtml,
//         }),
//       });
//       console.log("Decision email request sent to /api/send-email");
//     } catch (emailErr) {
//       console.error('Failed to trigger decision email via API route:', emailErr);
//     }

//     return NextResponse.json({ message: `Client ${decision.toLowerCase()} and notified.` });
//   } catch (error) {
//     console.error('Error updating client decision:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }, ['ADMIN', 'SUPER_ADMIN']);