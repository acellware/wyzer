/**
 * Builds the HTML for the OTP sign-in email.
 */
export function buildOtpEmail(code: string): string {
 return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Wyzer sign-in code</title>
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
                Your sign-in code
              </h1>
              <p style="margin:0 0 32px;font-size:16px;color:#6b6b6b;line-height:1.6;">
                Use the code below to sign in to Wyzer. It expires in <strong>15 minutes</strong>.
              </p>

              <!-- Code block -->
              <div style="background:#f4f4f0;border-radius:10px;padding:24px;text-align:center;margin-bottom:32px;">
                <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#0f0f0f;font-variant-numeric:tabular-nums;">
                  ${code}
                </span>
              </div>

              <p style="margin:0 0 8px;font-size:14px;color:#9b9b9b;line-height:1.6;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f0f0ec;">
              <p style="margin:0;font-size:13px;color:#9b9b9b;">
                © ${new Date().getFullYear()} Wyzer &nbsp;·&nbsp; Compliance Intelligence Platform
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
