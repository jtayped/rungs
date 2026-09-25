import { Resend } from 'resend'
import { env } from './env'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

// Gmail is hard on short, text-only mail from a sender it hasn't seen, so the
// code goes out as multipart HTML + text, says what it's for and links back to
// the site on the same domain it's sent from.
function codeEmail(code: string) {
  const site = env.SITE_URL.replace(/\/$/, '')
  const host = new URL(site).host

  const text = [
    'your sign-in code for rungs:',
    '',
    code,
    '',
    'enter it on the page that asked for it. it expires in ten minutes.',
    '',
    `someone asked to sign in to rungs (${host}) with this email address. if that wasn't you, you can ignore this and nothing will happen.`,
  ].join('\n')

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f5f5f7;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border-radius:24px;">
            <tr>
              <td style="padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1d1d1f;">
                <p style="margin:0 0 4px;font-size:15px;color:#6e6e73;">rungs</p>
                <p style="margin:0 0 24px;font-size:22px;font-weight:600;letter-spacing:-0.02em;">your sign-in code</p>
                <p style="margin:0 0 24px;font-size:36px;font-weight:600;letter-spacing:0.18em;font-variant-numeric:tabular-nums;">${code}</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.5;">enter it on the page that asked for it. it expires in ten minutes.</p>
                <p style="margin:0;font-size:13px;line-height:1.5;color:#6e6e73;">someone asked to sign in to <a href="${site}" style="color:#6e6e73;">${host}</a> with this email address. if that wasn't you, you can ignore this and nothing will happen.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  return { subject: `your rungs sign-in code: ${code}`, text, html }
}

export async function sendCode(email: string, code: string) {
  if (!resend) {
    // Local dev without a key: the code goes to the terminal instead.
    console.log(`sign-in code for ${email}: ${code}`)
    return
  }
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    ...codeEmail(code),
  })
  if (error) console.error('resend:', error)
}
