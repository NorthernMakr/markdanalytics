// Cloudflare Worker in front of the static site.
//
// Almost every request is handed straight to the built site (env.ASSETS).
// The exception is /ee/*: a stand-in for Adobe's Edge Network, so the Web SDK
// can run for real on this site without an Adobe account. It accepts the same
// requests Adobe's edge would, returns a minimal valid response (including a
// fake ECID so the SDK's identity step completes), and sends nothing to Adobe.

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  // Contact form (see handleContact below)
  CONTACT_EMAIL?: { send: (msg: Record<string, unknown>) => Promise<unknown> };
  CONTACT_TO?: string;   // secret: where messages are delivered (a verified address)
  CONTACT_FROM?: string; // optional: sender address on this domain
}

const ORG_COOKIE = (orgId: string) => `kndctr_${orgId.replace('@', '_')}_identity`;

function fakeEcid(): string {
  // 38 digits, the same shape as a real Experience Cloud ID
  let s = '';
  for (let i = 0; i < 38; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.get('cookie') ?? '';
  const hit = raw.split(/;\s*/).find((c) => c.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : undefined;
}

async function mockEdge(req: Request, url: URL): Promise<Response> {
  const cors = {
    'access-control-allow-origin': req.headers.get('origin') ?? '*',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'POST, GET, OPTIONS',
    'x-lab-mock-edge': 'true',
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  // sendBeacon-style /collect calls expect no body.
  if (url.pathname.includes('/collect')) return new Response(null, { status: 204, headers: cors });

  let body: any = {};
  try { body = await req.json(); } catch { /* empty or non-JSON body */ }

  const orgId: string = body?.meta?.configOverrides?.orgId
    ?? url.searchParams.get('orgId') ?? 'MARKDLAB000000000000000@AdobeOrg';
  const cookieName = ORG_COOKIE(orgId);
  // Reuse the visitor's fake ECID if the SDK already stored one, else mint one
  const existing = readCookie(req, cookieName);
  const ecid = existing?.startsWith('lab-ecid-') ? existing.slice(9) : fakeEcid();

  const response = {
    requestId: url.searchParams.get('requestId') ?? crypto.randomUUID(),
    handle: [
      {
        type: 'state:store',
        payload: [{ key: cookieName, value: 'lab-ecid-' + ecid, maxAge: 34128000 }],
      },
      {
        type: 'identity:result',
        payload: [{ id: ecid, namespace: { code: 'ECID' } }],
      },
      {
        // Echo back what was received, so it can be read in DevTools > Network > Response
        type: 'lab:received',
        payload: (body?.events ?? []).map((e: any) => ({ eventType: e?.xdm?.eventType, xdm: e?.xdm, data: e?.data })),
      },
    ],
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'content-type': 'application/json', ...cors },
  });
}

// ---------------------------------------------------------------------------
// Contact form: POST /api/contact
//
// The visitor's message is emailed to CONTACT_TO, a secret set in the
// Cloudflare dashboard, so the owner's address never appears in the site or
// the repository. Nothing is stored: the message exists only in that email.
// Spam checks: a hidden honeypot field, a minimum time on page, and size limits.
// ---------------------------------------------------------------------------
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);

async function handleContact(req: Request, env: Env): Promise<Response> {
  if (req.method !== 'POST') return json({ ok: false, error: 'Use POST.' }, 405);

  let f: Record<string, unknown> = {};
  try { f = await req.json(); } catch { return json({ ok: false, error: 'The form data could not be read.' }, 400); }

  // Bots fill the hidden field or submit instantly; pretend success so they move on.
  const elapsed = Date.now() - Number(f.startedAt ?? 0);
  if (String(f.website ?? '') !== '' || !(elapsed > 3000)) return json({ ok: true });

  const name = clean(f.name, 100);
  const email = clean(f.email, 200);
  const topic = clean(f.topic, 60) || 'General';
  const message = String(f.message ?? '').trim().slice(0, 5000);

  if (!name) return json({ ok: false, field: 'name', error: 'Add your name.' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, field: 'email', error: 'Add an email address I can reply to.' }, 400);
  if (message.length < 10) return json({ ok: false, field: 'message', error: 'Add a message of at least a sentence.' }, 400);

  if (!env.CONTACT_EMAIL || !env.CONTACT_TO) {
    return json({ ok: false, error: 'The contact form isn\'t switched on yet. Please try again later.' }, 503);
  }

  const host = new URL(req.url).hostname.replace(/^www\./, '');
  try {
    await env.CONTACT_EMAIL.send({
      to: env.CONTACT_TO,
      from: { email: env.CONTACT_FROM || `contact@${host}`, name: `${host} contact form` },
      replyTo: { email, name },
      subject: `[${host}] ${topic}: message from ${name}`,
      text: `From: ${name} <${email}>\nTopic: ${topic}\n\n${message}\n\n--\nSent from the contact form on ${host}. Reply to this email to answer ${name} directly.`,
    });
  } catch (e: any) {
    console.error('contact send failed', e?.code, e?.message);
    return json({ ok: false, error: 'The message couldn\'t be sent right now. Please try again in a few minutes.' }, 502);
  }
  return json({ ok: true });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/ee/')) return mockEdge(req, url);
    if (url.pathname === '/api/contact') return handleContact(req, env);
    return env.ASSETS.fetch(req);
  },
};
