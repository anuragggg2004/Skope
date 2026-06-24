// =============================================
// EMAIL SERVICE — Nodemailer + Gmail SMTP
// Sends password reset emails for Skope
// =============================================

import nodemailer from 'nodemailer'

// Lazy-create transporter so missing env vars don't crash startup
let _transporter = null

function getTransporter() {
  if (_transporter) return _transporter
  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS   // Gmail App Password (16 chars, no spaces)
    }
  })
  return _transporter
}

// ─── Send Password Reset Email ────────────────────────────
export async function sendPasswordResetEmail({ to, resetUrl, displayName }) {
  const transporter = getTransporter()

  const firstName = (displayName || to.split('@')[0]).split(' ')[0]

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your Skope password</title>
</head>
<body style="margin:0;padding:0;background:#080b14;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080b14;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#0d1120;border-radius:16px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f8ef7,#8b5cf6);padding:32px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 14px;display:inline-block;">
                    <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">🔭 Skope</span>
                  </td>
                </tr>
              </table>
              <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:12px 0 0;letter-spacing:0.5px;">AI-Powered Career Discovery</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 8px;">Reset your password</h1>
              <p style="color:rgba(240,242,255,0.5);font-size:14px;margin:0 0 24px;line-height:1.6;">
                Hey ${firstName}, we received a request to reset your Skope password.
                Click the button below — this link expires in <strong style="color:rgba(240,242,255,0.75);">1 hour</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#4f8ef7,#8b5cf6);border-radius:12px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:14px 36px;color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:0.2px;">
                      Reset Password →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="color:rgba(240,242,255,0.35);font-size:12px;margin:0 0 8px;">
                Button not working? Copy and paste this link:
              </p>
              <p style="margin:0 0 28px;">
                <a href="${resetUrl}" style="color:#4f8ef7;font-size:12px;word-break:break-all;">${resetUrl}</a>
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:0 0 24px;" />

              <p style="color:rgba(240,242,255,0.3);font-size:12px;line-height:1.6;margin:0;">
                If you didn't request this, you can safely ignore this email — your password won't change.
                <br/>This link will expire automatically after 1 hour.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:rgba(0,0,0,0.2);padding:20px 40px;text-align:center;">
              <p style="color:rgba(240,242,255,0.2);font-size:11px;margin:0;">
                © 2026 Skope · AI Career Discovery for Indian Students
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  await transporter.sendMail({
    from: `"Skope" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Reset your Skope password',
    html,
    text: `Hi ${firstName},\n\nReset your Skope password here (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore this email.\n\n— Skope Team`
  })

  console.log(`[Email] Password reset email sent to: ${to}`)
}
