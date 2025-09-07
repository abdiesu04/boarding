import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Generate a funding agreement PDF with client information and signature
 * @param clientInfo Client information
 * @param signatureDataURL Base64 encoded signature image
 * @returns PDF document as Uint8Array
 */
export async function generateFundingAgreementPDF(
  clientInfo: any,
  signatureDataURL: string
): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page to the document
  let page = pdfDoc.addPage([612, 792]); // Letter size
  
  // Embed standard fonts
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  
  // Set page margins
  const margin = 50;
  const width = page.getWidth() - margin * 2;
  
  // Add title
  page.drawText('CLIENT FUNDING AGREEMENT', {
    x: margin,
    y: page.getHeight() - margin,
    size: 16,
    font: timesRomanBoldFont,
    color: rgb(0, 0, 0),
  });
  
  // Add agreement text with more prominent client information
  const clientName = clientInfo?.user?.firstName 
    ? `${clientInfo.user.firstName}${clientInfo.user.lastName ? ' ' + clientInfo.user.lastName : ''}`
    : '_______';
  
  const clientAddress = clientInfo?.address && clientInfo?.city && clientInfo?.state && clientInfo?.zip
    ? `${clientInfo.address}, ${clientInfo.city}, ${clientInfo.state} ${clientInfo.zip}`
    : '___________';
    
  // Make sure phone is not empty or undefined
  const clientPhone = (clientInfo?.phone && clientInfo.phone !== '') 
    ? clientInfo.phone 
    : '___________________';
    
  const clientEmail = clientInfo?.user?.email || '___________________';
  
  // Log client info for debugging
  console.log('PDF Generator - Client Info:', {
    name: clientName,
    phone: clientInfo?.phone,
    processedPhone: clientPhone,
    email: clientEmail,
    address: clientAddress
  });
  
  // Log client info to help with debugging
  console.log('Client info for PDF:', { 
    name: clientName, 
    address: clientAddress,
    phone: clientPhone,
    email: clientEmail,
    rawClientInfo: clientInfo
  });
  
  const agreementText = `
This agreement is made between:
Client Name: ${clientName}
Address: ${clientAddress}
Phone: ${clientPhone}   Email: ${clientEmail}

AND

Service Provider: George Burgess   Contact Email: support@Un-Employed.io

1. Scope of Services
George The Credit Goat agrees to assist the Client in securing personal funding up to $50,000 through third-party lenders, based on the Client's qualifications.

2. Success Fee
Client agrees to pay a success fee of 10% of the total amount of funding received.

The success fee is due the same day funds are deposited into the Client's account.
Payment will be made via direct ACH withdrawal from the Client's account to George The Credit Goat.

Examples:
- If you receive $20,000, your success fee is $2,000 (10%).
- If you receive $40,000, your success fee is $4,000 (10%).

3. Authorization to Apply & Sign on Client's Behalf
By signing this agreement, the Client grants George The Credit Goat and its authorized representatives full permission to:
- Submit funding applications to third-party lenders on the Client's behalf.
- Review and sign loan-related documents necessary to secure funding.
- Communicate directly with lenders regarding the Client's application and required supporting information.

This authorization is strictly limited to activities related to securing personal and business funding.

4. Non-Payment Clause
If the success fee is not successfully collected via ACH on the day funding is received:
- The account will be turned over to our legal team at:

Love Law Group
331 E Main Street, Suite 200
Rock Hill, SC 29730

- Clients may be subject to legal action, including court costs, attorney's fees, and other enforcement measures as permitted by law.

5. Acknowledgment & Agreement
By signing below, the Client acknowledges they have read, understood, and agree to all terms of this agreement.
`;
  
  // Split text into lines and draw each line
  const lines = agreementText.split('\n');
  let y = page.getHeight() - margin - 30; // Start position after title
  const lineHeight = 14;
  
  for (const line of lines) {
    if (line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.') || 
        line.trim().startsWith('4.') || line.trim().startsWith('5.')) {
      // Draw section headers in bold
      page.drawText(line, {
        x: margin,
        y,
        size: 12,
        font: timesRomanBoldFont,
        color: rgb(0, 0, 0),
      });
    } else {
      // Draw regular text
      page.drawText(line, {
        x: margin,
        y,
        size: 10,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
    }
    
    y -= lineHeight;
    
    // Add a new page if we're running out of space
    if (y < margin) {
      page = pdfDoc.addPage([612, 792]);
      y = page.getHeight() - margin;
    }
  }
  
  // Add signature line
  y -= 30;
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + 200, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Client Signature', {
    x: margin,
    y: y - 15,
    size: 10,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  
  // Add date line
  page.drawLine({
    start: { x: margin + 250, y },
    end: { x: margin + 350, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Date', {
    x: margin + 250,
    y: y - 15,
    size: 10,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  
  // Add signature image if provided
  if (signatureDataURL) {
    try {
      // Extract the base64 data from the data URL
      const base64Data = signatureDataURL.split(',')[1];
      const signatureBytes = Buffer.from(base64Data, 'base64');
      
      // Embed the signature image
      const signatureImage = await pdfDoc.embedPng(signatureBytes);
      
      // Calculate appropriate signature size
      // We want the signature to fit nicely above the line
      const maxWidth = 200;
      const maxHeight = 50;
      
      // Get original dimensions
      const originalWidth = signatureImage.width;
      const originalHeight = signatureImage.height;
      
      // Calculate scale to fit within our constraints
      let scale = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
      
      // Apply the scale to get final dimensions
      const width = originalWidth * scale;
      const height = originalHeight * scale;
      
      // Position the signature above the signature line
      // y + 10 places it slightly above the line
      page.drawImage(signatureImage, {
        x: margin,
        y: y + 10,
        width: width,
        height: height,
      });
      
      // Add current date
      const currentDate = new Date().toLocaleDateString();
      page.drawText(currentDate, {
        x: margin + 250,
        y: y + 5,
        size: 10,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
    } catch (error) {
      console.error('Error embedding signature:', error);
    }
  }
  
  // Serialize the PDF to bytes
  return pdfDoc.save();
}
