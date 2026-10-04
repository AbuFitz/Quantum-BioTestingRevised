// Vercel serverless function: POST /api/enquiry
//
// Delivers an appointment enquiry to the team by email through Resend's HTTP API.
// Required environment variables (server-side only): RESEND_API_KEY, ENQUIRY_TO, ENQUIRY_FROM.
// If any is missing the function answers 503. It never reports success without the
// provider accepting the message. No date of birth is accepted or forwarded.

const TESTS = { mens: 'Men’s Health Check', womens: 'Women’s Health Check' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BODY = 8 * 1024;

const clean = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max) : '');
const oneLine = (v) => v.replace(/[\r\n]+/g, ' ');
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function validate(input) {
  const b = input && typeof input === 'object' ? input : {};
  const data = {
    submissionId: clean(b.submissionId, 64),
    test: clean(b.test, 10),
    name: clean(b.name, 120),
    email: clean(b.email, 200),
    phone: clean(b.phone, 30),
    clinic: clean(b.clinic, 120),
    date: clean(b.date, 10),
    notes: clean(b.notes, 1000),
    consent: b.consent === true,
    website: clean(b.website, 200),
  };
  const fields = {};
  if (!TESTS[data.test]) fields.test = 'Choose the test you are asking about.';
  if (!data.name) fields.name = 'Enter your full name.';
  if (data.phone.replace(/\D/g, '').length < 7) fields.phone = 'Enter a phone number we can reach you on.';
  if (!EMAIL.test(data.email)) fields.email = 'Enter a valid email address.';
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) fields.date = 'Choose a valid date.';
  if (!data.consent) fields.consent = 'Confirm you have read the Privacy Policy and agree to be contacted.';
  return { data, fields };
}

export function buildMessage(d, env) {
  const test = TESTS[d.test];
  const rows = [
    ['Test', test], ['Name', d.name], ['Email', d.email], ['Phone', d.phone],
    ['Preferred clinic or area', d.clinic || 'Not given'],
    ['Preferred date (a request, not confirmed)', d.date || 'Not given'],
    ['Notes', d.notes || 'None'],
  ];
  return {
    from: env.ENQUIRY_FROM,
    to: [env.ENQUIRY_TO],
    reply_to: d.email,
    subject: oneLine(`Appointment enquiry: ${test} (${d.name})`),
    text: `New appointment enquiry from the website. This is not a confirmed booking.\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n`,
    html: `<p>New appointment enquiry from the website. This is not a confirmed booking.</p><table cellpadding="6">${rows.map(([k, v]) => `<tr><th align="left">${esc(k)}</th><td>${esc(String(v))}</td></tr>`).join('')}</table>`,
  };
}

const send = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

async function readJson(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    return JSON.parse(Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body));
  }
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX_BODY) throw Object.assign(new Error('too large'), { code: 'TOO_LARGE' });
    chunks.push(c);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'method_not_allowed' });
  }
  let body;
  try {
    body = await readJson(req);
  } catch (e) {
    return send(res, e.code === 'TOO_LARGE' ? 413 : 400, { error: 'invalid_body' });
  }

  const { data, fields } = validate(body);
  // Honeypot: real visitors never fill this. Bots get a neutral success and nothing is sent.
  if (data.website) return send(res, 200, { ok: true });
  if (Object.keys(fields).length) return send(res, 422, { error: 'validation', fields });

  const env = process.env;
  if (!env.RESEND_API_KEY || !env.ENQUIRY_TO || !env.ENQUIRY_FROM) {
    return send(res, 503, { error: 'not_configured' });
  }

  try {
    const upstream = await fetch(env.RESEND_API_URL || 'https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        // Retries of the same submission cannot create a second email.
        ...(data.submissionId ? { 'Idempotency-Key': `enquiry-${data.submissionId}` } : {}),
      },
      body: JSON.stringify(buildMessage(data, env)),
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) return send(res, 502, { error: 'delivery_failed' });
    return send(res, 200, { ok: true });
  } catch {
    return send(res, 502, { error: 'delivery_failed' });
  }
}
