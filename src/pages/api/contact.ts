export const prerender = false;

import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

type Lang = 'en' | 'nl' | 'de' | 'es';

const confirmations: Record<Lang, { subject: string; greeting: (name: string) => string; body: string; sign: string }> = {
  en: {
    subject: 'We\'ve received your request — NextGen Finca',
    greeting: (name) => `Hi ${name},`,
    body: `Thank you for reaching out. We've received your assessment request and will review the details of your property shortly.<br><br>You can expect to hear from us <strong>within 4 hours on a workday</strong>. If your enquiry is urgent, feel free to WhatsApp us directly at <a href="https://wa.me/34639864420">+34 639 864 420</a>.`,
    sign: 'The NextGen Finca Team',
  },
  nl: {
    subject: 'Uw aanvraag is ontvangen — NextGen Finca',
    greeting: (name) => `Hallo ${name},`,
    body: `Bedankt voor uw bericht. We hebben uw assessmentaanvraag ontvangen en zullen de details van uw finca binnenkort bekijken.<br><br>U kunt verwachten <strong>binnen 4 uur op een werkdag</strong> van ons te horen. Als uw vraag urgent is, kunt u ons ook via WhatsApp bereiken: <a href="https://wa.me/34639864420">+34 639 864 420</a>.`,
    sign: 'Het NextGen Finca Team',
  },
  de: {
    subject: 'Ihre Anfrage ist eingegangen — NextGen Finca',
    greeting: (name) => `Hallo ${name},`,
    body: `Vielen Dank für Ihre Nachricht. Wir haben Ihre Bewertungsanfrage erhalten und werden die Details Ihrer Immobilie in Kürze prüfen.<br><br>Sie können <strong>innerhalb von 4 Stunden an einem Werktag</strong> mit einer Antwort rechnen. Bei dringenden Fragen erreichen Sie uns auch per WhatsApp: <a href="https://wa.me/34639864420">+34 639 864 420</a>.`,
    sign: 'Das NextGen Finca Team',
  },
  es: {
    subject: 'Hemos recibido su solicitud — NextGen Finca',
    greeting: (name) => `Hola ${name},`,
    body: `Gracias por ponerse en contacto con nosotros. Hemos recibido su solicitud de evaluación y revisaremos los detalles de su propiedad en breve.<br><br>Puede esperar una respuesta nuestra <strong>en menos de 4 horas en un día laborable</strong>. Si su consulta es urgente, no dude en escribirnos por WhatsApp: <a href="https://wa.me/34639864420">+34 639 864 420</a>.`,
    sign: 'El Equipo de NextGen Finca',
  },
};

function buildConfirmationHtml(lang: Lang, name: string): string {
  const c = confirmations[lang];
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
      <div style="background:#0f172a;padding:24px 32px;border-radius:12px 12px 0 0">
        <img src="https://nextgenfinca.com/logo-light.svg" alt="NextGen Finca" style="height:48px" />
      </div>
      <div style="background:#f8fafc;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
        <p style="margin:0 0 16px">${c.greeting(name)}</p>
        <p style="margin:0 0 24px;line-height:1.7">${c.body}</p>
        <p style="margin:0 0 4px;color:#64748b;font-size:14px">Kind regards,</p>
        <p style="margin:0;font-weight:bold">${c.sign}</p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #e2e8f0" />
        <p style="margin:0;font-size:12px;color:#94a3b8">
          NextGen Finca · Almansa, Spain ·
          <a href="https://nextgenfinca.com" style="color:#3b82f6">nextgenfinca.com</a>
        </p>
      </div>
    </div>
  `;
}

function buildInternalHtml(fields: Record<string, string>): string {
  const rows = [
    ['Name', fields.name],
    ['Email', `<a href="mailto:${fields.email}">${fields.email}</a>`],
    ['Phone', fields.phone || '—'],
    ['Location', fields.location || '—'],
    ['Property Type', fields.propertyType || '—'],
    ['Property Size', fields.propertySize || '—'],
    ['Current Internet', fields.currentInternet || '—'],
    ['Timeline', fields.timeline || '—'],
    ['Service Interest', fields.service || '—'],
    ['Budget', fields.budget || '—'],
    ['Message', fields.message ? fields.message.replace(/\n/g, '<br>') : '—'],
    ['Language', fields.lang],
  ];

  const tableRows = rows.map(([label, value]) =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-weight:600;width:160px;color:#475569;font-size:13px">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px">${value}</td></tr>`
  ).join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#1e293b">
      <div style="background:#0f172a;padding:16px 24px;border-radius:8px 8px 0 0">
        <h2 style="color:#fff;margin:0;font-size:16px;font-weight:600">New Assessment Request — NextGen Finca</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
        ${tableRows}
      </table>
    </div>
  `;
}

export const POST: APIRoute = async ({ request, redirect }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const honeypot = formData.get('_gotcha');
  if (honeypot && String(honeypot).length > 0) {
    return redirect('/en/contact/?success=1', 302);
  }

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const lang = (String(formData.get('lang') ?? 'en').trim()) as Lang;
  const phone = String(formData.get('phone') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const propertyType = String(formData.get('propertyType') ?? '').trim();
  const propertySize = String(formData.get('propertySize') ?? '').trim();
  const currentInternet = String(formData.get('currentInternet') ?? '').trim();
  const timeline = String(formData.get('timeline') ?? '').trim();
  const service = String(formData.get('service') ?? '').trim();
  const budget = String(formData.get('budget') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  if (!name || !email || !email.includes('@')) {
    return new Response('Missing required fields', { status: 400 });
  }

  const safeLang: Lang = ['en', 'nl', 'de', 'es'].includes(lang) ? lang : 'en';

  const smtpUser = import.meta.env.SMTP_USER;   // tim@nextgenfinca.com — the real Google account
  const smtpPass = import.meta.env.SMTP_PASS;   // App Password for that account
  const smtpFrom = import.meta.env.SMTP_FROM ?? smtpUser;  // info@nextgenfinca.com — the alias to send from
  const notifyEmail = import.meta.env.NOTIFY_EMAIL ?? 'invoice@nextgenfinca.com';

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await Promise.all([
        transporter.sendMail({
          from: `NextGen Finca <${smtpFrom}>`,
          to: notifyEmail,
          replyTo: email,
          subject: `New Assessment Request — ${name} (${service || 'General'})`,
          html: buildInternalHtml({ name, email, phone, location, propertyType, propertySize, currentInternet, timeline, service, budget, message, lang: safeLang }),
        }),
        transporter.sendMail({
          from: `NextGen Finca <${smtpFrom}>`,
          to: email,
          subject: confirmations[safeLang].subject,
          html: buildConfirmationHtml(safeLang, name),
        }),
      ]);
    } catch (err) {
      console.error('Email send failed:', err);
      return redirect(`/${safeLang}/contact/error/`, 302);
    }
  }

  return redirect(`/${safeLang}/contact/success/`, 302);
};
