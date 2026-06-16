export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, redirect }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const honeypot = formData.get('_gotcha');
  if (honeypot && String(honeypot).length > 0) {
    // Bot detected — silent success redirect
    return redirect('/en/contact/?success=1', 302);
  }

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const lang = String(formData.get('lang') ?? 'en').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const service = String(formData.get('service') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  if (!name || !email || !email.includes('@')) {
    return new Response('Missing required fields', { status: 400 });
  }

  const resendKey = import.meta.env.RESEND_API_KEY;

  if (resendKey) {
    try {
      const body = {
        from: 'NextGen Finca <noreply@nextgenfinca.com>',
        to: ['info@nextgenfinca.com'],
        reply_to: email,
        subject: `New Assessment Request — ${name} (${service || 'General'})`,
        html: `
          <h2>New Estate Assessment Request</h2>
          <table style="border-collapse:collapse;width:100%;max-width:600px">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;width:140px">Name</td><td style="padding:8px;border-bottom:1px solid #eee">${name}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Email</td><td style="padding:8px;border-bottom:1px solid #eee"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Phone</td><td style="padding:8px;border-bottom:1px solid #eee">${phone || '—'}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Location</td><td style="padding:8px;border-bottom:1px solid #eee">${location || '—'}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Service</td><td style="padding:8px;border-bottom:1px solid #eee">${service || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;vertical-align:top">Message</td><td style="padding:8px">${message.replace(/\n/g, '<br>')}</td></tr>
          </table>
          <p style="color:#888;font-size:12px;margin-top:24px">Sent from NextGen Finca website — Lang: ${lang}</p>
        `,
      };

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch {
      // Log but don't block the redirect — don't expose errors to user
      console.error('Email send failed');
    }
  }

  return redirect(`/${lang}/contact/?success=1`, 302);
};
