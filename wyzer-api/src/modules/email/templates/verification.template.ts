/**
 * Builds the HTML for the email verification email.
 * Plain TypeScript — no JSX dependency in the API.
 */
export function buildVerificationEmail(
  firstName: string,
  verificationUrl: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your Wyzer account</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e0;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1aff;padding:32px 40px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="6" fill="white" fill-opacity="0.2"/>
                      <path d="M4 17L7.5 7H9.5L12 13.2L14.5 7H16.5L20 17H17.8L15.5 10.8L13 17H11L8.5 10.8L6.2 17H4Z" fill="white"/>
                    </svg>
                  </td>
                  <td style="padding-left:12px;">
                    <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.02em;">wyzer</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f0f0f;letter-spacing:-0.02em;">
                Verify your email address
              </h1>
              <p style="margin:0 0 24px;font-size:16px;color:#6b6b6b;line-height:1.6;">
                Hi ${firstName}, welcome to Wyzer! Click the button below to confirm your email address and activate your account.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#1a1aff;border-radius:8px;">
                    <a href="${verificationUrl}"
                       style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:-0.01em;">
                      Verify email address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#9b9b9b;line-height:1.5;">
                If the button above doesn't work, copy and paste this URL into your browser:
              </p>
              <p style="margin:0 0 32px;font-size:12px;color:#1a1aff;word-break:break-all;">
                <a href="${verificationUrl}" style="color:#1a1aff;text-decoration:none;">${verificationUrl}</a>
              </p>

              <hr style="border:none;border-top:1px solid #e5e5e0;margin:0 0 24px;" />

              <p style="margin:0;font-size:13px;color:#9b9b9b;line-height:1.5;">
                This link expires in <strong>24 hours</strong>. If you didn't create a Wyzer account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:#f9f9f7;border-top:1px solid #e5e5e0;">
              <p style="margin:0;font-size:12px;color:#b0b0a8;text-align:center;">
                Wyzer · Compliance Intelligence Platform<br />
                <a href="https://wyzer.dev/privacy" style="color:#b0b0a8;text-decoration:underline;">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="https://wyzer.dev/terms" style="color:#b0b0a8;text-decoration:underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
