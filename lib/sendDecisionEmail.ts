// lib/sendDecisionEmail.ts
import nodemailer from "nodemailer";
import { getBaseUrl } from "./getBaseUrl";

export async function sendDecisionEmail(
  to: string,
  { name, decision }: { name: string; decision: "APPROVED" | "REJECTED" }
) {
  console.log("Testing SMTP with config:");
    console.log("Host:", process.env.SMTP_HOST);
    console.log("Port:", process.env.SMTP_PORT);
    console.log("User:", process.env.SMTP_USER);
  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log(process.env.SMTP_USER)

  const subject = `Your funding request has been ${decision.toLowerCase()}`;

  const mailOptions = {
    from: `"Funding Decisions" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${subject}</title>
        </head>
        <body style="background: #f6faff; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #f6faff; min-height: 100vh;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 18px; box-shadow: 0 4px 24px #0001; margin: 40px 0; padding: 32px 32px 24px 32px;">
                  <tr>
                    <td align="center" style="padding-bottom: 18px;">
                      <h1 style="color: ${decision === "APPROVED" ? "#16a34a" : "#dc2626"}; font-size: 1.7rem; margin: 0 0 8px 0;">
                        ${
                          decision === "APPROVED"
                            ? "🎉 Great news!"
                            : "We have an update"
                        }
                      </h1>
                      <p style="color: #64748b; font-size: 1rem; margin: 0 0 18px 0;">Hi ${name},</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style="background: ${
                        decision === "APPROVED" ? "#ecfdf5" : "#fef2f2"
                      }; border-radius: 10px; padding: 18px 16px; margin-bottom: 18px;">
                        <p style="color: ${
                          decision === "APPROVED" ? "#166534" : "#991b1b"
                        }; font-size: 1.05rem; margin: 0 0 8px 0;">
                          <b>Your request has been ${decision.toLowerCase()}.</b>
                        </p>
                        ${
                          decision === "APPROVED"
                            ? `<p style="color: #334155; font-size: 0.98rem; margin: 0;">Congratulations! You can now proceed with your agreement and next steps.</p>`
                            : `<p style="color: #334155; font-size: 0.98rem; margin: 0;">Unfortunately, your request has been rejected. If you’d like more details, please contact our support team.</p>`
                        }
                      </div>
                      ${
                        decision === "APPROVED"
                          ? `<a href="${getBaseUrl()}/" style="display: block; background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%); color: #fff; text-decoration: none; text-align: center; border-radius: 8px; padding: 14px 0; font-size: 1.05rem; font-weight: 600; margin-bottom: 18px; box-shadow: 0 2px 8px #22c55e33;">
                              View My Agreement →
                            </a>`
                          : ""
                      }
                      <p style="color: #64748b; font-size: 0.95rem; text-align: center; margin: 0;">Thank you for trusting us with your funding needs.</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 24px;">
                      <p style="color: #b0b8c9; font-size: 0.9rem; margin: 0;">&copy; ${new Date().getFullYear()} Premium Financial Services</p>
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
