
import nodemailer from 'nodemailer';
import { getBaseUrl } from './getBaseUrl';

export async function sendOnboardingEmail(to: string, { name, nextStepUrl }: { name: string; nextStepUrl: string }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // If nextStepUrl is a relative path, prepend the base URL
  const absoluteNextStepUrl = nextStepUrl.startsWith('http')
    ? nextStepUrl
    : getBaseUrl() + nextStepUrl;

  const mailOptions = {
    from: `"Client Onboarding" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Welcome! Continue Your Onboarding',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Complete Your Onboarding</title>
        </head>
        <body style="background: #f6faff; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #f6faff; min-height: 100vh;">
            <tr>
              <td align="center">
                <table width="420" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 18px; box-shadow: 0 4px 24px #0001; margin: 40px 0; padding: 32px 32px 24px 32px;">
                  <tr>
                    <td align="center" style="padding-bottom: 18px;">
                      <h1 style="color: #2563eb; font-size: 1.7rem; margin: 0 0 8px 0;">What's your next step?</h1>
                      <p style="color: #64748b; font-size: 1rem; margin: 0 0 18px 0;">Hi ${name}, please complete your onboarding to continue.</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style="background: #f1f5ff; border-radius: 10px; padding: 18px 16px; margin-bottom: 18px;">
                        <p style="color: #2563eb; font-size: 1.05rem; margin: 0 0 8px 0;"><b>You're almost there!</b></p>
                        <p style="color: #64748b; font-size: 0.98rem; margin: 0;">Please provide your credit report and sign the required documents to finish onboarding.</p>
                      </div>
                      <a href="${absoluteNextStepUrl}" style="display: block; background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%); color: #fff; text-decoration: none; text-align: center; border-radius: 8px; padding: 14px 0; font-size: 1.1rem; font-weight: 600; margin-bottom: 18px; box-shadow: 0 2px 8px #2563eb22;">
                        Continue Onboarding &rarr;
                      </a>
                      <p style="color: #64748b; font-size: 0.95rem; text-align: center; margin: 0;">If you have already completed this step, you can ignore this email.</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 24px;">
                      <p style="color: #b0b8c9; font-size: 0.9rem; margin: 0;">&copy; 2025 Premium Financial Services</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
